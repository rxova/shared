import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { ESLint, type Linter } from "eslint";
import tseslint from "typescript-eslint";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { baseEslintConfig, rxova } from "@rxova/repo-config/eslint";

const FILES: Record<string, string> = {
  "tsconfig.json": JSON.stringify({
    compilerOptions: {
      strict: true,
      jsx: "react-jsx",
      module: "ESNext",
      moduleResolution: "bundler",
      skipLibCheck: true,
      noEmit: true,
    },
    include: ["src"],
  }),
  "src/lib.ts": [
    "export const pick = (value: string | undefined): string => value ?? 'none';",
    "export const always = (value: object): object | null => (value ? value : null);",
    "console.log(pick(undefined));",
    "",
  ].join("\n"),
  "src/lib.test.ts": [
    "const value = JSON.parse('{}') as { a?: string };",
    "console.log(value.a!);",
    "",
  ].join("\n"),
  "src/view.tsx": [
    "import { useEffect, useState } from 'react';",
    "export const View = ({ items }: { items: string[] }) => {",
    "  const [count] = useState(0);",
    "  if (count > 1) useEffect(() => undefined);",
    "  return <ul>{items.map((item) => <li>{item}</li>)}<img src='x.png' /></ul>;",
    "};",
    "",
  ].join("\n"),
  "src/script.js": "export const run = () => process.exit(window.innerWidth);\n",
  "src/page.astro": "---\nconst title = 'x';\n---\n<h1>{title}</h1>\n",
  "dist/out.ts": "export const ignored = 1 as any;\n",
  "vitest.config.ts": "export default {} as any;\n",
};

let root = "";

beforeAll(() => {
  root = realpathSync(mkdtempSync(join(tmpdir(), "rxova-eslint-")));
  for (const [path, contents] of Object.entries(FILES)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
});

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

const eslint = (config: Linter.Config[]) =>
  new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: config });

const rulesFor = async (config: Linter.Config[], file: string) => {
  const computed = (await eslint(config).calculateConfigForFile(join(root, file))) as
    Linter.Config | undefined;
  return computed?.rules ?? {};
};

const severity = (entry: Linter.RuleEntry | undefined) => (Array.isArray(entry) ? entry[0] : entry);

const lint = async (config: Linter.Config[], file: string) => {
  const [result] = await eslint(config).lintFiles([join(root, file)]);
  return (result?.messages.map((message) => message.ruleId ?? message.message) ?? []).sort();
};

const base = () => ({ tsconfigRootDir: root });

describe("rxova()", () => {
  it("needs the tsconfig root", () => {
    expect(() => rxova({} as never)).toThrow(/tsconfigRootDir/);
    expect(() => rxova({ tsconfigRootDir: "" })).toThrow(/tsconfigRootDir/);
  });

  it("is recommendedTypeChecked plus the shared correctness rules, and no opinions", async () => {
    const rules = await rulesFor(rxova(base()), "src/lib.ts");
    expect(severity(rules["@typescript-eslint/no-floating-promises"])).toBe(2);
    expect(severity(rules["@typescript-eslint/no-unnecessary-condition"])).toBeUndefined();
    expect(rules["@typescript-eslint/no-unused-vars"]).toEqual([2, { argsIgnorePattern: "^_" }]);
    expect(rules["@typescript-eslint/consistent-type-imports"]).toEqual([
      2,
      { fixStyle: "inline-type-imports" },
    ]);
    expect(severity(rules["@typescript-eslint/no-explicit-any"])).toBe(2);
    expect(severity(rules["no-console"])).toBe(2);
    expect(rules["no-restricted-imports"]).toBeUndefined();
    expect(rules["@typescript-eslint/prefer-for-of"]).toBeUndefined();
    expect(rules["@typescript-eslint/array-type"]).toBeUndefined();
  });

  it("swaps in strictTypeChecked with strict", async () => {
    const rules = await rulesFor(rxova({ ...base(), strict: true }), "src/lib.ts");
    expect(severity(rules["@typescript-eslint/no-unnecessary-condition"])).toBe(2);
    expect(await lint(rxova({ ...base(), strict: true }), "src/lib.ts")).toEqual([
      "@typescript-eslint/no-unnecessary-condition",
      "no-console",
    ]);
  });

  it("merges configs into the TypeScript block with extends", async () => {
    const rules = await rulesFor(
      rxova({ ...base(), extends: [tseslint.configs.stylisticTypeChecked] }),
      "src/lib.ts",
    );
    expect(severity(rules["@typescript-eslint/prefer-for-of"])).toBe(2);
    expect(
      (await rulesFor(rxova({ ...base(), extends: [] }), "src/script.js"))[
        "@typescript-eslint/prefer-for-of"
      ],
    ).toBeUndefined();
  });

  it("lints JavaScript with @eslint/js only, and globals only where asked", async () => {
    expect(await lint(rxova(base()), "src/script.js")).toEqual(["no-undef", "no-undef"]);
    expect(await lint(rxova({ ...base(), node: true, browser: true }), "src/script.js")).toEqual(
      [],
    );
    expect(
      await lint(rxova({ ...base(), node: ["src/**"], browser: ["other/**"] }), "src/script.js"),
    ).toEqual(["no-undef"]);
  });

  it("ignores build output, tool config and the extra globs", async () => {
    const config = rxova({ ...base(), ignores: ["src/view.tsx"] });
    const linter = eslint(config);
    expect(await linter.isPathIgnored(join(root, "dist/out.ts"))).toBe(true);
    expect(await linter.isPathIgnored(join(root, "vitest.config.ts"))).toBe(true);
    expect(await linter.isPathIgnored(join(root, "src/view.tsx"))).toBe(true);
    expect(await linter.isPathIgnored(join(root, "src/lib.ts"))).toBe(false);
  });

  it("turns no-console off on consoleAllowed globs", async () => {
    const rules = await rulesFor(
      rxova({ ...base(), consoleAllowed: ["src/lib.ts"] }),
      "src/lib.ts",
    );
    expect(severity(rules["no-console"])).toBe(0);
  });

  it("applies rules to TypeScript after the layers", async () => {
    const config = rxova({
      ...base(),
      react: true,
      rules: { "react/jsx-key": "off", "no-restricted-imports": ["error", { paths: ["x"] }] },
    });
    const rules = await rulesFor(config, "src/view.tsx");
    expect(severity(rules["react/jsx-key"])).toBe(0);
    expect(severity(rules["no-restricted-imports"])).toBe(2);
    expect((await rulesFor(config, "src/script.js"))["no-restricted-imports"]).toBeUndefined();
  });

  it("relaxes test files with the tests layer, on the default globs or the given ones", async () => {
    const strict = { ...base(), strict: true };
    expect(await lint(rxova(strict), "src/lib.test.ts")).toEqual([
      "@typescript-eslint/no-non-null-assertion",
      "no-console",
    ]);
    expect(await lint(rxova({ ...strict, tests: true }), "src/lib.test.ts")).toEqual([]);
    const custom = await rulesFor(
      rxova({ ...strict, tests: { files: ["src/lib.ts"] } }),
      "src/lib.ts",
    );
    expect(severity(custom["@typescript-eslint/no-unnecessary-condition"])).toBe(0);
    const config = (await eslint(rxova({ ...strict, tests: true })).calculateConfigForFile(
      join(root, "src/lib.test.ts"),
    )) as Linter.Config;
    expect(Object.keys(config.languageOptions?.globals ?? {})).toEqual(
      expect.arrayContaining(["vi", "jest", "window", "process"]),
    );
  });

  it("adds react, react-hooks and jsx-a11y on .tsx with react", async () => {
    const messages = await lint(rxova({ ...base(), react: true }), "src/view.tsx");
    expect(messages).toEqual(
      expect.arrayContaining(["react-hooks/rules-of-hooks", "react/jsx-key", "jsx-a11y/alt-text"]),
    );
    const without = await lint(rxova(base()), "src/view.tsx");
    expect(without.filter((id) => /^(react|jsx-a11y)/.test(id))).toEqual([]);
    const rules = await rulesFor(rxova({ ...base(), react: true }), "src/lib.ts");
    expect(rules["react/jsx-key"]).toBeUndefined();
  });

  it("lets react drop hooks or a11y, widen its files and name effect hooks", async () => {
    const config = rxova({
      ...base(),
      react: { hooks: false, a11y: false, files: ["src/**/*.{ts,tsx}"] },
    });
    const messages = await lint(config, "src/view.tsx");
    expect(messages).toContain("react/jsx-key");
    expect(messages).not.toContain("react-hooks/rules-of-hooks");
    expect(messages).not.toContain("jsx-a11y/alt-text");
    expect(severity((await rulesFor(config, "src/lib.ts"))["react/jsx-key"])).toBe(2);
    const named = (await eslint(
      rxova({ ...base(), react: { additionalHooks: "(useSafeLayoutEffect)" } }),
    ).calculateConfigForFile(join(root, "src/view.tsx"))) as Linter.Config;
    expect(named.settings?.["react-hooks"]).toEqual({
      additionalEffectHooks: "(useSafeLayoutEffect)",
    });
  });

  it("parses and lints .astro files with astro", async () => {
    expect(await lint(rxova({ ...base(), astro: true }), "src/page.astro")).toEqual([]);
    const config = (await eslint(rxova({ ...base(), astro: true })).calculateConfigForFile(
      join(root, "src/page.astro"),
    )) as Linter.Config;
    expect(config.languageOptions?.globals).toMatchObject({ window: false });
    // Without the layer no config matches `.astro`, so ESLint skips those files.
    expect(await eslint(rxova(base())).isPathIgnored(join(root, "src/page.astro"))).toBe(true);
  });

  it("appends extra configs last", async () => {
    const rules = await rulesFor(
      rxova(
        { ...base(), tests: true },
        { files: ["**/*.test.ts"], rules: { "no-console": "error" } },
      ),
      "src/lib.test.ts",
    );
    expect(severity(rules["no-console"])).toBe(2);
  });
});

describe("baseEslintConfig (deprecated)", () => {
  it("keeps the 0.2 behaviour: strict, stylistic, node globals and no relative imports", async () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated wrapper is what is under test
    const config = baseEslintConfig({ tsconfigRootDir: root });
    const rules = await rulesFor(config, "src/lib.ts");
    expect(severity(rules["@typescript-eslint/no-unnecessary-condition"])).toBe(2);
    expect(severity(rules["@typescript-eslint/prefer-for-of"])).toBe(2);
    expect(severity(rules["no-restricted-imports"])).toBe(2);
    expect(await lint(config, "src/script.js")).toEqual(["no-undef"]);
    expect(await lint(config, "src/lib.test.ts")).toEqual([]);
  });

  it("still takes consoleAllowed and ignores", async () => {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the deprecated wrapper is what is under test
    const config = baseEslintConfig({
      tsconfigRootDir: root,
      consoleAllowed: ["src/lib.ts"],
      ignores: ["src/view.tsx"],
    });
    expect(severity((await rulesFor(config, "src/lib.ts"))["no-console"])).toBe(0);
    expect(await eslint(config).isPathIgnored(join(root, "src/view.tsx"))).toBe(true);
  });
});

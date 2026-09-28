import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { configDefaults } from "vitest/config";
import { baseVitestConfig } from "@/vitest/base-vitest-config";

describe("baseVitestConfig", () => {
  it("holds every file to the shared thresholds", () => {
    const coverage = baseVitestConfig().test?.coverage;
    expect(coverage).toMatchObject({
      provider: "v8",
      thresholds: { perFile: true, statements: 95, branches: 95, functions: 95, lines: 95 },
    });
  });

  it("defaults to Node, colocated tests and the log plus lcov reporters", () => {
    const { test } = baseVitestConfig();
    expect(test?.environment).toBe("node");
    expect(test?.include).toEqual(["src/**/*.test.ts", "src/**/*.test.tsx"]);
    expect(test?.coverage).toMatchObject({ reporter: ["text", "lcov"] });
  });

  it("keeps barrels, types, tests and fixtures out of coverage, plus any extra", () => {
    const { test } = baseVitestConfig({ exclude: ["src/generated.ts"] });
    expect(test?.coverage).toMatchObject({
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.fixtures.{ts,tsx}",
        "src/**/*.types.ts",
        "src/index.ts",
        "src/generated.ts",
      ],
    });
  });

  it("takes the environment, discovery globs and reporters from the package", () => {
    const { test } = baseVitestConfig({
      environment: "jsdom",
      include: ["test/**/*.ts"],
      reporter: ["json-summary"],
    });
    expect(test?.environment).toBe("jsdom");
    expect(test?.include).toEqual(["test/**/*.ts"]);
    expect(test?.coverage).toMatchObject({ reporter: ["json-summary"] });
  });

  it("lets a package set its own thresholds, one axis at a time", () => {
    const coverage = baseVitestConfig({ thresholds: { branches: 88, functions: 100 } }).test
      ?.coverage;
    expect(coverage).toMatchObject({
      thresholds: { perFile: true, statements: 95, branches: 88, functions: 100, lines: 95 },
    });
  });

  it("measures the files a package names, and keeps others out of discovery", () => {
    const { test } = baseVitestConfig({
      coverageInclude: ["src/**/*.ts"],
      testExclude: ["src/**/*.browser.test.tsx"],
    });
    expect(test?.coverage).toMatchObject({ include: ["src/**/*.ts"] });
    expect(test?.exclude).toEqual([...configDefaults.exclude, "src/**/*.browser.test.tsx"]);
    expect(baseVitestConfig().test?.exclude).toEqual([...configDefaults.exclude]);
    expect(baseVitestConfig().test?.coverage).toMatchObject({ include: ["src/**/*.{ts,tsx}"] });
  });

  it("maps @/ to the package src, from root", () => {
    const alias = baseVitestConfig({ root: "/repo/packages/lib" }).resolve?.alias as {
      find: RegExp;
      replacement: string;
    }[];
    expect(alias).toHaveLength(1);
    const resolve = (specifier: string) =>
      alias.reduce((id, { find, replacement }) => id.replace(find, replacement), specifier);
    expect(resolve("@/scope/decide-scope")).toBe(
      `${join("/repo/packages/lib", "src")}/scope/decide-scope`,
    );
    expect(resolve("vitest/config")).toBe("vitest/config");
    expect(baseVitestConfig().resolve?.alias).toHaveLength(1);
  });
});

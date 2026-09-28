// @ts-check
// Plain JavaScript on purpose: ESLint and the pre-commit hook load this before
// anything is built, so it cannot come from dist.
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, globalIgnores } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

const require = createRequire(import.meta.url);

/** @typedef {import("eslint").Linter.Config} Config */
/** @typedef {import("eslint").Linter.RulesRecord} RulesRecord */
/** @typedef {import("eslint").ESLint.Plugin} Plugin */
/** @typedef {import("./eslint.js").RxovaEslintOptions} RxovaEslintOptions */

const TS_FILES = ["**/*.{ts,tsx,mts,cts}"];
const REACT_FILES = ["**/*.{tsx,jsx}"];
const ASTRO_FILES = ["**/*.astro"];
const TEST_FILES = [
  "**/*.{test,spec}.{ts,tsx,mts,cts,js,jsx,mjs}",
  "**/__tests__/**",
  "**/__fixtures__/**",
  "**/*.fixtures.{ts,tsx}",
  "**/e2e/**",
  "test/**",
];

/**
 * Loads an opt-in layer's plugin only when the layer is on, so a repository
 * without React never installs eslint-plugin-react. Resolved with the `import`
 * conditions (eslint-plugin-astro exports nothing else) and loaded with
 * `require`, which reaches ES modules on every Node this package supports, so
 * the factory stays synchronous.
 *
 * @param {() => string} resolve `import.meta.resolve` of the plugin, written at the call site.
 * @param {string} name
 * @param {string} layer
 * @returns {any}
 */
const plugin = (resolve, name, layer) => {
  let url;
  try {
    url = resolve();
  } catch (error) {
    throw new Error(
      `@rxova/repo-config/eslint: the \`${layer}\` layer needs ${name}. Install it as a dev dependency.`,
      { cause: error },
    );
  }
  const loaded = /** @type {{ default?: unknown }} */ (require(fileURLToPath(url)));
  return loaded.default ?? loaded;
};

/**
 * The React version eslint-plugin-react checks against. Its own `"detect"`
 * calls `context.getFilename()`, which ESLint 10 removed, so the version is read
 * here: the `react` the repository root resolves, else the plugin's "latest".
 *
 * @param {string} tsconfigRootDir
 * @returns {string}
 */
const reactVersion = (tsconfigRootDir) => {
  try {
    const fromRoot = createRequire(join(tsconfigRootDir, "package.json"));
    return /** @type {{ version: string }} */ (fromRoot("react/package.json")).version;
  } catch {
    return "999.999.999";
  }
};

/**
 * @param {boolean | readonly string[]} option
 * @param {Record<string, unknown>} globalSet
 * @returns {Config[]}
 */
const globalsLayer = (option, globalSet) => {
  if (option === false) return [];
  const block = { languageOptions: { globals: { ...globalSet } } };
  return [option === true ? block : { files: [...option], ...block }];
};

/**
 * Rules the base turns on for every TypeScript file, beyond the recommended
 * sets. Each is a correctness rule some rxova repository enforced before the
 * factory existed; none is about layout or project structure.
 *
 * @type {RulesRecord}
 */
const BASE_RULES = {
  // Shared preset, overlock, use-everywhere: `_`-prefixed arguments are deliberate.
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
  // Every repository: under `verbatimModuleSyntax` a type import that is not
  // marked as one is kept at runtime.
  "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
  // journey names it; recommended already has it.
  "@typescript-eslint/no-explicit-any": "error",
  // Shared preset, react-inputs, ts-extended-errors: shipped code logs nothing.
  // `consoleAllowed` and the tests layer switch it off where output is the point.
  "no-console": "error",
};

/**
 * Relaxed on test files by the `tests` layer: rules that are wrong about
 * tests rather than about the code under test.
 *
 * @type {RulesRecord}
 */
const TEST_RULES = {
  "@typescript-eslint/no-unnecessary-condition": "off",
  "@typescript-eslint/no-empty-function": "off",
  "@typescript-eslint/unbound-method": "off",
  "@typescript-eslint/no-non-null-assertion": "off",
  "@typescript-eslint/no-unsafe-assignment": "off",
  "@typescript-eslint/no-unsafe-member-access": "off",
  "@typescript-eslint/no-unsafe-call": "off",
  "@typescript-eslint/no-unsafe-return": "off",
  "@typescript-eslint/no-unsafe-argument": "off",
  "@typescript-eslint/no-confusing-void-expression": "off",
  "@typescript-eslint/require-await": "off",
  "@typescript-eslint/await-thenable": "off",
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
  "@typescript-eslint/no-redundant-type-constituents": "off",
  "no-console": "off",
};

/**
 * @param {RxovaEslintOptions["react"]} react
 * @param {string} tsconfigRootDir
 * @param {Record<string, Plugin>} plugins
 * @returns {Config[]}
 */
const reactLayer = (react, tsconfigRootDir, plugins) => {
  if (react === undefined || react === false) return [];
  const {
    files = REACT_FILES,
    hooks = true,
    a11y = true,
    additionalHooks,
    version = reactVersion(tsconfigRootDir),
  } = react === true ? {} : react;
  const reactPlugin = plugin(
    () => import.meta.resolve("eslint-plugin-react"),
    "eslint-plugin-react",
    "react",
  );
  plugins.react = reactPlugin.configs.flat.recommended.plugins.react;
  /** @type {Config[]} */
  const configs = [
    {
      files: [...files],
      ...reactPlugin.configs.flat.recommended,
      settings: { react: { version } },
    },
    { files: [...files], ...reactPlugin.configs.flat["jsx-runtime"] },
  ];
  if (hooks) {
    const hooksPlugin = plugin(
      () => import.meta.resolve("eslint-plugin-react-hooks"),
      "eslint-plugin-react-hooks",
      "react",
    );
    plugins["react-hooks"] = hooksPlugin.configs.flat.recommended.plugins["react-hooks"];
    configs.push({
      files: [...files],
      ...hooksPlugin.configs.flat.recommended,
      // Read by `exhaustive-deps` and the compiler rules alike.
      ...(additionalHooks === undefined
        ? {}
        : { settings: { "react-hooks": { additionalEffectHooks: additionalHooks } } }),
    });
  }
  if (a11y) {
    const a11yPlugin = plugin(
      () => import.meta.resolve("eslint-plugin-jsx-a11y"),
      "eslint-plugin-jsx-a11y",
      "react",
    );
    plugins["jsx-a11y"] = a11yPlugin.flatConfigs.recommended.plugins["jsx-a11y"];
    configs.push({ files: [...files], ...a11yPlugin.flatConfigs.recommended });
  }
  return configs;
};

/**
 * @param {boolean | undefined} astro
 * @param {string} tsconfigRootDir
 * @returns {Config[]}
 */
const astroLayer = (astro, tsconfigRootDir) => {
  if (astro !== true) return [];
  const astroPlugin = plugin(
    () => import.meta.resolve("eslint-plugin-astro"),
    "eslint-plugin-astro",
    "astro",
  );
  return [
    ...astroPlugin.configs.recommended,
    {
      // The astro parser otherwise infers the root by scanning for tsconfigs,
      // and fails when it finds two — a checkout under `.claude/worktrees/` is
      // enough, and ignoring that path does not help: inference runs first.
      files: ASTRO_FILES,
      languageOptions: {
        globals: { ...globals.browser },
        parserOptions: { tsconfigRootDir },
      },
    },
  ];
};

/**
 * @param {RxovaEslintOptions["tests"]} tests
 * @returns {Config[]}
 */
const testsLayer = (tests) => {
  if (tests === undefined || tests === false) return [];
  const { files = TEST_FILES } = tests === true ? {} : tests;
  return [
    {
      files: [...files],
      languageOptions: {
        globals: { ...globals.vitest, ...globals.jest, ...globals.browser, ...globals.node },
      },
      rules: TEST_RULES,
    },
  ];
};

/**
 * The flat config every rxova repository lints with: `@eslint/js` recommended,
 * typescript-eslint `recommendedTypeChecked` (or `strictTypeChecked`), a few
 * correctness rules, and opt-in layers. No formatting, import-path or
 * project-structure opinions: a repository adds those through `rules` or
 * `extra`.
 *
 * @param {RxovaEslintOptions} options
 * @param {...Config} extra Appended last, so they win.
 * @returns {Config[]}
 */
export const rxova = (options, ...extra) => {
  const {
    tsconfigRootDir,
    strict = false,
    react = false,
    astro = false,
    node = false,
    browser = false,
    tests = false,
    ignores = [],
    consoleAllowed = [],
    rules = {},
    extends: tsExtends = [],
  } = options;
  // Checked here because a JavaScript caller gets no type error, and without
  // it the parser picks a root on its own and fails far from the cause.
  if (typeof tsconfigRootDir !== "string" || tsconfigRootDir === "") {
    throw new TypeError(
      "@rxova/repo-config/eslint: pass `tsconfigRootDir: import.meta.dirname` from eslint.config.js.",
    );
  }
  /** @type {Record<string, Plugin>} */
  const plugins = { "@typescript-eslint": /** @type {Plugin} */ (tseslint.plugin) };
  const layers = [
    ...reactLayer(react, tsconfigRootDir, plugins),
    ...astroLayer(astro, tsconfigRootDir),
  ];
  return defineConfig(
    globalIgnores([
      "**/dist/",
      "**/build/",
      "**/coverage/",
      "**/.turbo/",
      // Astro writes these type declarations on every build.
      "**/.astro/",
      // Local agent state; `.claude/worktrees/` can hold whole checkouts of the repo.
      "**/.claude/",
      "**/node_modules/",
      "**/test-results/",
      "**/playwright-report/",
      // Tool config lives outside the type-checked programs; linting it with
      // projectService would demand a tsconfig per config file.
      "**/*.config.{js,cjs,mjs,ts,mts,cts}",
      "**/knip.{js,cjs,mjs,ts,mts,cts}",
      ...ignores,
    ]),
    // Every plugin a layer loaded (the very object its configs register, or
    // ESLint refuses to "redefine" it), registered for every file: a rule in
    // `rules`, the tests layer or `extra` can then name one on any file
    // without "could not find plugin".
    { plugins },
    js.configs.recommended,
    {
      files: TS_FILES,
      extends: [
        strict ? tseslint.configs.strictTypeChecked : tseslint.configs.recommendedTypeChecked,
        ...tsExtends,
      ],
      languageOptions: { parserOptions: { projectService: true, tsconfigRootDir } },
      rules: BASE_RULES,
    },
    ...globalsLayer(node, globals.node),
    ...globalsLayer(browser, globals.browser),
    ...layers,
    // After the layers, so a repository can tune a layer's rule here.
    ...(Object.keys(rules).length === 0 ? [] : [{ files: TS_FILES, rules }]),
    ...testsLayer(tests),
    ...(consoleAllowed.length === 0
      ? []
      : [{ files: [...consoleAllowed], rules: { "no-console": "off" } }]),
    ...extra,
  );
};

const RELATIVE_IMPORT_BAN = {
  patterns: [
    { group: ["./*", "../*"], message: "Import through the @/… alias, not a relative path." },
  ],
};

/**
 * The 0.2 preset, kept for one minor: `strictTypeChecked` plus
 * `stylisticTypeChecked`, Node globals, no console outside `consoleAllowed`, no
 * relative imports.
 *
 * @deprecated Use `rxova({ tsconfigRootDir, strict: true, node: true, tests: true, … })`.
 * Removed in 0.4.0.
 * @param {import("./eslint.js").BaseEslintOptions} options
 * @param {...Config} extra
 * @returns {Config[]}
 */
export const baseEslintConfig = (
  { tsconfigRootDir, consoleAllowed = ["packages/repo-config/**"], ignores = [] },
  ...extra
) =>
  rxova(
    {
      tsconfigRootDir,
      strict: true,
      node: true,
      tests: true,
      consoleAllowed,
      ignores,
      rules: { "no-restricted-imports": ["error", RELATIVE_IMPORT_BAN] },
      extends: [tseslint.configs.stylisticTypeChecked],
    },
    ...extra,
  );

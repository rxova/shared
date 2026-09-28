---
"@rxova/repo-config": minor
---

One Prettier preset for every rxova repository: semicolons, double quotes, `trailingComma: "all"`, `arrowParens: "always"`, `printWidth: 100`, and `prettier-plugin-astro` built in with the `*.astro` override. `@rxova/repo-config/prettier` is now a JavaScript module (it was JSON); `.prettierrc` keeps `"@rxova/repo-config/prettier"`. Every consumer reformats once. `prettier-plugin-astro` is a dependency so consumers do not install it. New `@rxova/repo-config/lint-staged`: re-export it from `lint-staged.config.js`.

New ESLint factory `rxova(options, ...extra)` from `@rxova/repo-config/eslint`: `@eslint/js` recommended plus typescript-eslint `recommendedTypeChecked` (`strict: true` for `strictTypeChecked`) and the correctness rules the rxova repositories already enforce, with opt-in `react` (eslint-plugin-react, react-hooks, jsx-a11y), `astro`, `node`, `browser` and `tests` layers, and `ignores`, `consoleAllowed`, `extends` and `rules` options. It carries no formatting, import-path or project-structure rules. `baseEslintConfig` still works and is deprecated: replace `baseEslintConfig({ tsconfigRootDir, consoleAllowed, ignores })` with `rxova({ tsconfigRootDir, strict: true, node: true, tests: true, consoleAllowed, ignores, extends: [tseslint.configs.stylisticTypeChecked], rules: { "no-restricted-imports": [...] } })` to keep the 0.2 behaviour. It is removed in 0.4.0. Through the wrapper, `.mts`/`.cts` files are now type-checked like `.ts`, and test files get the wider `tests` relaxations.

New tsconfig presets beside `tsconfig.base.json`: `tsconfig.dom.json` (adds `DOM` and `DOM.Iterable`), `tsconfig.react.json` (dom plus `jsx: "react-jsx"`) and `tsconfig.node.json` (for scripts Node runs with type stripping: `NodeNext`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, Node types).

`baseVitestConfig` takes `plugins`, `dedupe`, `alias`, `testTimeout`, `hookTimeout`, `globals`, `setupFiles`, `fileParallelism`, `silent`, `reportsDirectory`, `coverage: false` (no coverage block) and `thresholds: false` (report without enforcing), and `browser: { include, instances, provider, headless?, name? }` with `unitName` to split the suite into a unit and a browser project. Without them the config is unchanged. The option types are exported from `@rxova/repo-config/vitest`.

New tsdown presets `dualBuildConfig` (ESM + CJS, neutral, es2020, `.mjs`/`.cjs`, tree-shaken) and `reactBuildConfig` (dual, React never bundled, only `@rxova/ts-utils` may be).

New `@rxova/repo-config/playwright` (`basePlaywrightConfig`, `astroPreview`), `@rxova/repo-config/knip` (`baseKnipConfig`) and `@rxova/repo-config/changelog` (`@changesets/changelog-github` without the "Thanks" line: set `"changelog": ["@rxova/repo-config/changelog", { "repo": "owner/name" }]`). `@playwright/test`, `knip`, `@changesets/changelog-github`, `prettier` and the four ESLint plugins are optional peers.

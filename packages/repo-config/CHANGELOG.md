# @rxova/repo-config

## 0.5.0

### Minor Changes

- [#33](https://github.com/rxova/shared/pull/33) [`6ccc115`](https://github.com/rxova/shared/commit/6ccc115fd82cb77b6188ae57ff0a674470882cc8) - Add `init`: turns a repository created from a template into its own project (renames, labels, Pages).

## 0.4.1

### Patch Changes

- [#27](https://github.com/rxova/shared/pull/27) [`13167fc`](https://github.com/rxova/shared/commit/13167fc22a3692718a5d4964848ed84b9e92f8e3) - `check-snippets` no longer reads a ` ```json ` fence as ` ```js `, so JSON fences stop being reported as unparseable. `@vitest/coverage-v8`, which the vitest preset's coverage uses, is now declared as an optional peer dependency (`>=3`, matching `vitest`).

## 0.4.0

### Minor Changes

- [#25](https://github.com/rxova/shared/pull/25) [`1d8da46`](https://github.com/rxova/shared/commit/1d8da46878a56c667f6a4477492bf7ed1ed548a2) - `check-scope` also reports a documentation-only range: `code-changed=false` when every changed file is documentation under the new `repoConfig.scope` (`ignore`, default `**/*.md` and `**/*.mdx`; `keep`, default `packages/*/*/**` and test and fixture folders; none deleted), plus the new `docs-only` and `docs-changed` (`scope.site`, default `apps/docs/**`) outputs. A repository whose docs-site build is gated on `code-changed` alone should add `|| docs-changed == 'true'`; `"ignore": []` keeps the old behaviour.

## 0.3.0

### Minor Changes

- [#22](https://github.com/rxova/shared/pull/22) [`93cfa93`](https://github.com/rxova/shared/commit/93cfa93b515e307ac1f38c60ddcece10819a7b3a) - One Prettier preset for every rxova repository: semicolons, double quotes, `trailingComma: "all"`, `arrowParens: "always"`, `printWidth: 100`, and `prettier-plugin-astro` built in with the `*.astro` override. `@rxova/repo-config/prettier` is now a JavaScript module (it was JSON); `.prettierrc` keeps `"@rxova/repo-config/prettier"`. Every consumer reformats once. `prettier-plugin-astro` is a dependency so consumers do not install it. New `@rxova/repo-config/lint-staged`: re-export it from `lint-staged.config.js`.
  
  New ESLint factory `rxova(options, ...extra)` from `@rxova/repo-config/eslint`: `@eslint/js` recommended plus typescript-eslint `recommendedTypeChecked` (`strict: true` for `strictTypeChecked`) and the correctness rules the rxova repositories already enforce, with opt-in `react` (eslint-plugin-react, react-hooks, jsx-a11y), `astro`, `node`, `browser` and `tests` layers, and `ignores`, `consoleAllowed`, `extends` and `rules` options. It carries no formatting, import-path or project-structure rules. `baseEslintConfig` still works and is deprecated: replace `baseEslintConfig({ tsconfigRootDir, consoleAllowed, ignores })` with `rxova({ tsconfigRootDir, strict: true, node: true, tests: true, consoleAllowed, ignores, extends: [tseslint.configs.stylisticTypeChecked], rules: { "no-restricted-imports": [...] } })` to keep the 0.2 behaviour. It is removed in 0.4.0. Through the wrapper, `.mts`/`.cts` files are now type-checked like `.ts`, and test files get the wider `tests` relaxations.
  
  New tsconfig presets beside `tsconfig.base.json`: `tsconfig.dom.json` (adds `DOM` and `DOM.Iterable`), `tsconfig.react.json` (dom plus `jsx: "react-jsx"`) and `tsconfig.node.json` (for scripts Node runs with type stripping: `NodeNext`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, Node types).
  
  `baseVitestConfig` takes `plugins`, `dedupe`, `alias`, `testTimeout`, `hookTimeout`, `globals`, `setupFiles`, `fileParallelism`, `silent`, `reportsDirectory`, `coverage: false` (no coverage block) and `thresholds: false` (report without enforcing), and `browser: { include, instances, provider, headless?, name? }` with `unitName` to split the suite into a unit and a browser project. Without them the config is unchanged. The option types are exported from `@rxova/repo-config/vitest`.
  
  New tsdown presets `dualBuildConfig` (ESM + CJS, neutral, es2020, `.mjs`/`.cjs`, tree-shaken) and `reactBuildConfig` (dual, React never bundled, only `@rxova/ts-utils` may be).
  
  New `@rxova/repo-config/playwright` (`basePlaywrightConfig`, `astroPreview`), `@rxova/repo-config/knip` (`baseKnipConfig`) and `@rxova/repo-config/changelog` (`@changesets/changelog-github` without the "Thanks" line: set `"changelog": ["@rxova/repo-config/changelog", { "repo": "owner/name" }]`). `@playwright/test`, `knip`, `@changesets/changelog-github`, `prettier` and the four ESLint plugins are optional peers.

- [#23](https://github.com/rxova/shared/pull/23) [`198653c`](https://github.com/rxova/shared/commit/198653c3c83e59a8c82911e8033f511b343cdbcb) - New commands, so a repository deletes its copied scripts: `pre-push`, `lint-changesets`, `add-changeset`, `version`, `check-majors`, `check-exports`, `post-publish-smoke`, `check-tsdoc`, `check-banned`, `check-snippets`, `check-test-scripts`, `check-file-size`, `coverage-summary` and `list-packages`. `verify` steps take `skipOnRelease` and fold into log groups on GitHub Actions; `check-changeset` takes `changeset.scope: "shipped"` and lints the changesets it finds; `pack-smoke` reads a package's own `repoConfig.packSmoke` (`load`, `bins`, `run`), probes subpath-only packages and checks stylesheet imports; `check-llms` takes `repoConfig.llms` (`api`, `entries`, `sections`, `requiredTerms`, `idsFrom`/`idPattern`, `rootIndex`) with per-package overrides. New exports: `parsePackageConfig`, `readPackageConfig` and the config types. `check-llms` now accepts `## Use` in place of `## Install`.

## 0.2.0

### Minor Changes

- [#16](https://github.com/rxova/shared/pull/16) [`c0751c1`](https://github.com/rxova/shared/commit/c0751c1508528abbdd2d8221f8fd2ddd342294ca) - `pack-smoke` finds nested and glob `files` entries in the tarball, resolves `workspace:` peers and optional dependencies, and fails when an `exports` target is missing, when sources or tests ship unlisted, or when a built entry drops its source's `'use client'` directive. `baseVitestConfig` takes `thresholds`, `coverageInclude` and `testExclude`.
  
  `check-changeset` and `check-scope` now see both sides of a rename, so a shipped file moved out of its package still needs a changeset.

## 0.1.0

### Minor Changes

- [#8](https://github.com/rxova/shared/pull/8) [`6862335`](https://github.com/rxova/shared/commit/68623359553f1aa31c39eb42e30c0ee8105e6276) - One function per file, named after it, grouped in topic folders and imported as `@/<topic>/<file>` (the eslint preset now rejects relative imports, and the vitest preset takes `root` and maps `@/` and `@rxova-<workspace>/`), and only public functions in the package: everything used internally moves to the private `@rxova/helpers` workspace and is bundled in. The library API changes with it: `verify` is now `runSteps`, `STEPS` is `defaultSteps()`, and `SKIP_LABEL`, `PAGE_BUNDLE_FILENAME` and `packagesNamed` are no longer exported. The `rxova-repo-config` commands are unchanged.

- [#6](https://github.com/rxova/shared/pull/6) [`d8a0b89`](https://github.com/rxova/shared/commit/d8a0b894a16b95f980f723973f407462e63fdf98) - Publish the repo scripts as `@rxova/repo-config`, with an `rxova-repo-config` bin:
  `verify`, `check-changeset`, `check-scope`, `node-floor`, `pack-smoke` and `check-llms`. Also ship the tsdown, vitest, eslint, commitlint and prettier presets.

- [#7](https://github.com/rxova/shared/pull/7) [`6df9e45`](https://github.com/rxova/shared/commit/6df9e4507f273da585b3da3a83d8d2e44a0bc03c) - Export the shared TypeScript base as `@rxova/repo-config/tsconfig.base.json`, so a repository extends it instead of carrying its own copy.

### Patch Changes

- [#10](https://github.com/rxova/shared/pull/10) [`80a6ef6`](https://github.com/rxova/shared/commit/80a6ef6a122ad108d48b7f42551ae2db3f46ec9f) - The internal helpers move from a separate private workspace into `src/internal/`, and the vitest preset maps only `@/`. No change to the exports or the commands.

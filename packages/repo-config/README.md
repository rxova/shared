# @rxova/repo-config

Repository maintenance for rxova monorepos. It provides:

- the `rxova-repo-config` scripts that CI and the git hooks run;
- the presets that build, test, lint and commitlint read.

One dev dependency replaces a copy of each script in every repository.

```sh
pnpm add -D @rxova/repo-config
```

## Commands

Run each command from the repository root, except `pack-smoke` and `check-exports`, which run from
a package directory.

| Command                                            | What it does                                                                                                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rxova-repo-config verify [--only a,b]`            | Runs the pre-push gate in order and stops at the first failure. The steps come from `repoConfig.verify.steps`, or a default pnpm and Turborepo list.                              |
| `rxova-repo-config pre-push [--only a,b]`          | The whole `.husky/pre-push` hook: a push that only deletes refs verifies nothing, any other push runs `verify`.                                                                   |
| `rxova-repo-config check-changeset`                | Fails when a published package changed and no changeset was added, or when an added changeset would break the changelog. Reads `BASE_SHA`, `HEAD_SHA`, `PR_LABELS`, `PR_TITLE`.   |
| `rxova-repo-config lint-changesets`                | Fails a waiting changeset with a summary line `@changesets/changelog-github` reads as metadata (`commit:`, `pr:`, `author:`), and, with `singlePackage`, one naming two packages. |
| `rxova-repo-config add-changeset <pkg> <bump> <…>` | Writes a one-package changeset without the prompt. `<pkg>` is a name, a name without its scope, or a directory. `--help` lists the packages.                                      |
| `rxova-repo-config version`                        | The release `version` script: `changeset version`, the root version synced from `changeset.syncRootVersionFrom`, then `pnpm install --lockfile-only`.                             |
| `rxova-repo-config check-scope`                    | Writes `code-changed=false` to `GITHUB_OUTPUT` for a release commit, which contains only version and changelog edits.                                                             |
| `rxova-repo-config check-majors`                   | Fails when the published packages (or `majors.packages`) are not on one major version.                                                                                            |
| `rxova-repo-config node-floor`                     | Writes to `GITHUB_OUTPUT` the single `engines.node` floor that all published packages share.                                                                                      |
| `rxova-repo-config pack-smoke [dir]`               | Packs the package, installs it in a scratch project, loads it, runs its bins and checks the tarball: see [Pack smoke](#pack-smoke).                                               |
| `rxova-repo-config check-exports [--profile p]`    | `publint --strict`, then `attw --pack .` with the profile from the flag or the package's `repoConfig.exports.profile`. Needs `publint` and `@arethetypeswrong/cli`.               |
| `rxova-repo-config post-publish-smoke`             | After a release, waits for npm to serve each version in `PUBLISHED_PACKAGES`, installs them into a scratch project and loads them through `import` and `require`.                 |
| `rxova-repo-config check-llms [root]`              | Checks each published `llms.txt`: title, summary, sections, `files`, and its table against the source. See [llms.txt](#llmstxt). Needs `typescript`.                              |
| `rxova-repo-config check-tsdoc`                    | Fails a callable export of a published package's entry that has no TSDoc summary. Needs `typescript`.                                                                             |
| `rxova-repo-config check-banned`                   | Fails a hand-written doc or README that names a removed API from `docs.banned`.                                                                                                   |
| `rxova-repo-config check-snippets`                 | Fails a `ts`, `tsx`, `js` or `jsx` fence in the READMEs and `llms.txt` files that does not parse. Needs `typescript`.                                                             |
| `rxova-repo-config check-test-scripts`             | Fails a workspace that has a `vitest.config.*` and no `test` script, which no Turborepo task would run.                                                                           |
| `rxova-repo-config check-file-size`                | Fails a tracked file over `fileSize.max` lines; the `fileSize.allow` list only shrinks.                                                                                           |
| `rxova-repo-config coverage-summary [path]`        | Appends the totals of `coverage/coverage-summary.json` (the `json-summary` reporter) to `GITHUB_STEP_SUMMARY`, or prints them.                                                    |
| `rxova-repo-config list-packages [--marker key]`   | Prints `dirs=<json>` and `dirs_list=<words>` for a CI matrix: the published packages, or those whose manifest sets `key`. `--github-output` appends to `GITHUB_OUTPUT`.           |

Published packages are the directories under `packages/` whose manifest is not `private`. Nothing
needs to be listed by hand.

A `.husky/pre-push` hook is one line:

```sh
pnpm exec rxova-repo-config pre-push
```

### Pack smoke

`pack-smoke` fails when the tarball:

- misses a `files` entry, the README or the license. Nested paths (`assets/logo.svg`) and globs
  (`schemas/*.json`) count when they match a file in the tarball.
- misses a file the manifest points at: every `exports` target (`.d.cts` and `.cjs` included),
  `main`, `module`, `types` and each bin.
- ships sources or tests: anything under `src/`, `e2e/` or a `__tests__` directory, or any
  `*.test.*` or `*.spec.*` file. A `files` entry that names that kind of path (`"src"`,
  `"e2e/fixtures.json"`) allows it; `"dist"` bringing in `dist/a.test.js` does not.
- drops a `'use client'` directive: when `src/<entry>.ts(x)` opens with one, the built
  `dist/<entry>.js` and `.cjs` must too, after any `"use strict"`. Entries whose source has none
  are not checked.
- has an exported stylesheet whose relative `@import` points at nothing in the tarball.

The package is imported and required by name; a package whose `exports` lists subpaths only is
loaded through each subpath with a JavaScript target instead. Every bin must print a version for
`--version`.

`workspace:` specs are resolved the way `pnpm publish` writes them. `dependencies` and
`optionalDependencies` point at a packed tarball of the workspace package. `peerDependencies`
become the published range (`workspace:^` is `^<version>`), and the peer's tarball is installed
beside the package.

A package adjusts this in its own `package.json`:

```json
{
  "repoConfig": {
    "packSmoke": {
      "load": "never",
      "bins": { "rxova-codemod": { "args": ["--help"], "expect": "input-otp-to-otp" } },
      "run": [
        {
          "bin": "rxova-codemod",
          "args": ["input-otp-to-otp", "fixture.tsx"],
          "fixture": { "path": "fixture.tsx", "contents": "import { OTPInput } from 'input-otp'" },
          "expect": ["OtpInput"]
        }
      ]
    }
  }
}
```

- `load: "never"` skips the import probe, for a package that ships TypeScript or Astro sources.
- `bins` replaces a bin's `--version` check with `args` and the text it must print (on stdout or
  stderr); `false` runs no bin.
- `run` writes each `fixture` into the scratch project, runs the installed bin, and checks the
  fixture (or the output, without one) holds every `expect` string.

### llms.txt

`check-llms` applies `repoConfig.llms` to every published package; a package's own
`package.json#repoConfig.llms` overrides `api`, `requiredTerms`, `idPattern` and `idsFrom` for it.

| Key                    | Values                                                                                                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api`                  | `exact` (default): the `## API` table and the entries name the same exports. `documented`: every documented name is exported. `props`: every `## Props` name is a property in `src/types.ts`. `none`. |
| `entries`              | `index` (default) reads `src/index.ts`; `subpaths` also reads every `src/<dir>/index.ts`.                                                                                                             |
| `sections`             | The `## ` headings required, `A\|B` for either. Default `["Install\|Use", "Docs"]`; `API` is added for `api: "exact"`.                                                                                |
| `requiredTerms`        | Strings the file must contain: commands, URLs.                                                                                                                                                        |
| `idsFrom`, `idPattern` | `"path/to/types.ts#RULE_IDS"` names an exported `as const` array; every id must appear, and any `idPattern` match that is not an id fails.                                                            |
| `rootIndex`            | `true` (default): the root `llms.txt` exists and links every package's file.                                                                                                                          |

## Configuration

Everything is optional. Settings go in the root `package.json` under `repoConfig`; per-package
settings (`packSmoke`, `llms`, `exports.profile`) go in that package's own `package.json`. An
unknown key is an error, not a silent default.

```json
{
  "repoConfig": {
    "verify": {
      "steps": [
        { "name": "audit", "command": "pnpm audit:check", "skipOnRelease": true },
        { "name": "lint", "command": "pnpm lint" },
        { "name": "changesets", "command": "rxova-repo-config lint-changesets" },
        { "name": "unit tests", "command": "pnpm exec turbo run test" }
      ]
    },
    "changeset": {
      "singlePackage": true,
      "scope": "shipped",
      "roots": ["packages", "apps"],
      "aliasPrefix": "journey-",
      "includePrivate": false,
      "syncRootVersionFrom": "@rxova/journey-core"
    },
    "majors": { "packages": ["@rxova/journey-core", "@rxova/journey-react"] },
    "tsdoc": { "entries": { "@rxova/journey-core": "packages/core/src/index.ts" }, "exclude": [] },
    "docs": {
      "root": "apps/docs/src/content/docs",
      "banned": [{ "name": "useApi", "pattern": "\\buseApi\\b" }],
      "allow": ["**/releases.md"],
      "exclude": ["**/api/reference/**"],
      "readmes": true
    },
    "snippets": { "include": ["README.md", "packages/*/README.md"], "skipInfo": ["live"] },
    "packages": { "marker": "rxova.slug" },
    "postPublish": { "importPattern": "^@rxova/react-", "peers": { "react": "^19" } },
    "llms": { "api": "documented", "entries": "subpaths" },
    "testScripts": { "globs": ["packages/*", "apps/*"] },
    "fileSize": { "max": 500, "ignore": ["pnpm-lock.yaml"], "allow": [] }
  }
}
```

- `verify.steps[].skipOnRelease` skips a step on the release pull request
  (`GITHUB_HEAD_REF=changeset-release/main`). On GitHub Actions each step folds into its own log
  group.
- `changeset.singlePackage` requires each changeset to name exactly one package.
  `changeset.scope` is `code` (default: a package's code changed, markdown and tests aside) or
  `shipped` (anything its tarball ships changed, README and `llms.txt` included; `src/` and
  `tsdown.config.*` count when `files` lists `dist`).
- `changeset.roots`, `aliasPrefix` and `includePrivate` set the packages `add-changeset` offers;
  `.changeset/config.json#ignore` is left out. `syncRootVersionFrom` is read by `version`.
- `docs.banned` patterns are regex sources; `allow` and `exclude` are globs under `docs.root`.
- `snippets.include` takes globs, files and directories.
- `postPublish.importPattern` is a regex source; every published package is imported without it.

## Presets

One preset per tool. Repository differences are options, not copies.

| Import                                   | Use                                                                                                                                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@rxova/repo-config/eslint`              | `rxova(options, ...extra)`: the flat config, see [ESLint](#eslint).                                                                                                                     |
| `@rxova/repo-config/prettier`            | Semicolons, double quotes, `printWidth: 100`, `trailingComma: "all"`, `arrowParens: "always"`, with `prettier-plugin-astro` built in for `*.astro`.                                     |
| `@rxova/repo-config/lint-staged`         | ESLint then Prettier over staged code (`.astro` included), Prettier over JSON, CSS, Markdown, YAML and HTML.                                                                            |
| `@rxova/repo-config/tsdown`              | `baseBuildConfig`: ESM, Node 22, `.js`/`.d.ts`. `dualBuildConfig`: ESM + CJS, neutral, es2020, `.mjs`/`.cjs`. `reactBuildConfig`: dual, React external, only `@rxova/ts-utils` bundled. |
| `@rxova/repo-config/vitest`              | `baseVitestConfig(options)`: 95% per-file coverage; `@/` is `<root>/src`; see [Vitest](#vitest).                                                                                        |
| `@rxova/repo-config/playwright`          | `basePlaywrightConfig(options)` and `astroPreview(port)`; see [Playwright](#playwright).                                                                                                |
| `@rxova/repo-config/knip`                | `baseKnipConfig({ docsApp, ignoreDependencies, ignoreBinaries, ignore, workspaces })`: config hints are errors; the docs app may depend on `@rxova/brand`.                              |
| `@rxova/repo-config/commitlint`          | Conventional Commits with no length limits, plus `rename`.                                                                                                                              |
| `@rxova/repo-config/changelog`           | `@changesets/changelog-github` without the "Thanks @user!" line.                                                                                                                        |
| `@rxova/repo-config/tsconfig.base.json`  | Strict TypeScript for ESM libraries: ES2023, no DOM, `bundler` resolution, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noEmit`.                                              |
| `@rxova/repo-config/tsconfig.dom.json`   | The base plus `DOM` and `DOM.Iterable`.                                                                                                                                                 |
| `@rxova/repo-config/tsconfig.react.json` | The dom preset plus `jsx: "react-jsx"`.                                                                                                                                                 |
| `@rxova/repo-config/tsconfig.node.json`  | Scripts Node runs with type stripping: `NodeNext`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, Node types.                                                                      |

The presets that ESLint, Prettier, lint-staged, changesets and the commit hook load before anything
is built ship as plain JavaScript. Their tools are optional peer dependencies: install the ones you
use. `prettier-plugin-astro` is the one dependency, so `.astro` files format with nothing else
installed.

```js
// eslint.config.js
import { rxova } from "@rxova/repo-config/eslint";
export default rxova({ tsconfigRootDir: import.meta.dirname, node: true, tests: true });

// lint-staged.config.js
export { default } from "@rxova/repo-config/lint-staged";

// commitlint.config.js
export { default } from "@rxova/repo-config/commitlint";

// tsdown.config.ts, a React component package
import { defineConfig } from "tsdown";
import { reactBuildConfig } from "@rxova/repo-config/tsdown";
export default defineConfig(reactBuildConfig({ banner: { js: "'use client';" } }));
```

```json
// .prettierrc
"@rxova/repo-config/prettier"
```

```json
// tsconfig.json
{ "extends": "@rxova/repo-config/tsconfig.react.json", "include": ["src"] }
```

```json
// .changeset/config.json
{ "changelog": ["@rxova/repo-config/changelog", { "repo": "rxova/<repo>" }] }
```

### ESLint

`rxova(options, ...extra)` returns a flat config: `@eslint/js` recommended, typescript-eslint
`recommendedTypeChecked` with `projectService` on `.ts`/`.tsx`/`.mts`/`.cts`, and these rules on
TypeScript: `no-unused-vars` (`_`-prefixed arguments allowed), `consistent-type-imports` (inline
fixes), `no-explicit-any` and `no-console`. Build output, caches, `.claude/`, test reports and tool
config files (`*.config.*`, `knip.*`) are ignored. There are no formatting, import-path or project-structure
rules: add them through `rules`, `extends` or `extra`.

| Option            | Effect                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tsconfigRootDir` | Required: `import.meta.dirname`.                                                                                                                                                                                                        |
| `strict`          | `strictTypeChecked` instead of `recommendedTypeChecked`.                                                                                                                                                                                |
| `react`           | `true` or `{ files, hooks, a11y, additionalHooks, version }`: eslint-plugin-react (+ JSX runtime), react-hooks and jsx-a11y, on `**/*.{tsx,jsx}` unless `files` widens it. `additionalHooks` is a regex source for custom effect hooks. |
| `astro`           | eslint-plugin-astro `recommended`, browser globals and the tsconfig root pinned on `.astro` files.                                                                                                                                      |
| `node`, `browser` | Globals on every file (`true`) or on the given globs.                                                                                                                                                                                   |
| `tests`           | `true` or `{ files }`: vitest, jest, browser and Node globals and the test relaxations (`no-unsafe-*`, `no-non-null-assertion`, `no-console`, …) on test files, fixtures and `e2e/`.                                                    |
| `ignores`         | Global ignores added to the defaults.                                                                                                                                                                                                   |
| `consoleAllowed`  | Globs where `no-console` is off: CLIs and scripts.                                                                                                                                                                                      |
| `extends`         | Configs merged into the TypeScript block, below the relaxations: `[tseslint.configs.stylisticTypeChecked]`.                                                                                                                             |
| `rules`           | Rules for TypeScript files, after the layers and before the test and console relaxations.                                                                                                                                               |

`extra` configs are appended last, so they win. Each layer loads its plugin only when it is on:
`eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` and
`eslint-plugin-astro` are optional peers.

Migrating from `baseEslintConfig` (deprecated, removed in 0.4.0):

```js
import { rxova } from "@rxova/repo-config/eslint";
import tseslint from "typescript-eslint";

export default rxova({
  tsconfigRootDir: import.meta.dirname,
  strict: true,
  node: true,
  tests: true,
  consoleAllowed: ["scripts/**"],
  // Only to keep what baseEslintConfig added on top:
  extends: [tseslint.configs.stylisticTypeChecked],
  rules: {
    "no-restricted-imports": ["error", { patterns: [{ group: ["./*", "../*"] }] }],
  },
});
```

### Vitest

`baseVitestConfig` options: `root`, `environment`, `include`, `testExclude`, `coverageInclude`,
`exclude`, `thresholds` (single axes, or `false` to report without enforcing), `reporter`,
`coverage: false` (no coverage block), `reportsDirectory`, `plugins`, `dedupe`, `alias` (after
`@/`), `testTimeout`, `hookTimeout`, `globals`, `setupFiles`, `fileParallelism`, `silent`, and
`browser` with `unitName`, which split the suite into a unit project and a browser project:

```ts
// vitest.config.ts, a React component package
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { baseVitestConfig } from "@rxova/repo-config/vitest";

export default baseVitestConfig({
  root: import.meta.dirname,
  plugins: [react()],
  dedupe: ["react", "react-dom"],
  browser: {
    include: ["src/**/*.browser.test.tsx"],
    instances: [{ browser: "chromium" }],
    provider: playwright(),
  },
  thresholds: { branches: 90 },
});
```

`vitest --project unit` never starts a browser.

### Playwright

```ts
// playwright.config.ts
import { basePlaywrightConfig } from "@rxova/repo-config/playwright";

export default basePlaywrightConfig({
  command: "pnpm run preview",
  port: 4175,
  browsers: ["chromium", "firefox", "webkit"],
});
```

Every spec runs in each browser as its desktop device, one worker by default. CI (`CI` set) gets
two retries, `forbidOnly`, the GitHub reporter and a fresh server; a local run reuses a running
server. `url` replaces `port` for another host; `projects` are appended; `testDir`, `retries`,
`workers`, `fullyParallel`, `timeout`, `webServerTimeout`, `reuseExistingServer`, `trace`,
`screenshot`, `reporter`, `snapshotPathTemplate`, `forbidOnly`, `stdout` and `testIgnore` override
the defaults. `astroPreview(port)` is the command that serves an Astro build.

## License

MIT

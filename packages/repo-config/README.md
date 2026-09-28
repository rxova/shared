# @rxova/repo-config

Repository maintenance for rxova monorepos. It provides:

- the `rxova-repo-config` scripts that CI and the git hooks run;
- the presets that build, test, lint and commitlint read.

One dev dependency replaces a copy of each script in every repository.

```sh
pnpm add -D @rxova/repo-config
```

## Commands

Run each command from the repository root, except `pack-smoke`, which runs from a package directory.

| Command                                 | What it does                                                                                                                                                                              |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rxova-repo-config verify [--only a,b]` | Runs the pre-push gate in order and stops at the first failure. The steps come from `package.json#repoConfig.verify.steps`, or a default pnpm and Turborepo list.                         |
| `rxova-repo-config check-changeset`     | Fails when a published package changed and no changeset was added. Reads `BASE_SHA` and `HEAD_SHA`. `PR_LABELS` or `PR_TITLE` can carry `skip-changeset`.                                 |
| `rxova-repo-config check-scope`         | Writes `code-changed=false` to `GITHUB_OUTPUT` for a release commit, which contains only version and changelog edits.                                                                     |
| `rxova-repo-config node-floor`          | Writes to `GITHUB_OUTPUT` the single `engines.node` floor that all published packages share.                                                                                              |
| `rxova-repo-config pack-smoke [dir]`    | Packs the package, installs it in a scratch project, then imports and requires it. It also runs every bin with `--version` and checks the tarball: see [Pack smoke](#pack-smoke).         |
| `rxova-repo-config check-llms [root]`   | Checks each published `llms.txt`: its title, summary and sections, that it appears in `files`, and that its `## API` table matches `src/index.ts` in both directions. Needs `typescript`. |

Published packages are the directories under `packages/` whose manifest is not `private`. Nothing
needs to be listed by hand.

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

`workspace:` specs are resolved the way `pnpm publish` writes them. `dependencies` and
`optionalDependencies` point at a packed tarball of the workspace package. `peerDependencies`
become the published range (`workspace:^` is `^<version>`), and the peer's tarball is installed
beside the package.

## Configuration

Everything is optional. Settings go in the root `package.json`:

```json
{
  "repoConfig": {
    "verify": {
      "steps": [
        { "name": "lint", "command": "pnpm lint" },
        { "name": "unit tests", "command": "pnpm exec turbo run test" }
      ]
    },
    "changeset": { "singlePackage": true }
  }
}
```

`singlePackage` requires each changeset to name exactly one package. An unknown key is an error,
not a silent default.

## Presets

| Import                                  | Use                                                                                                                                                                                                            |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@rxova/repo-config/tsdown`             | `baseBuildConfig(overrides)`: ESM, Node 22, `.js`/`.d.ts`, types, clean.                                                                                                                                       |
| `@rxova/repo-config/vitest`             | `baseVitestConfig({ root, environment, include, testExclude, coverageInclude, exclude, thresholds, reporter })`: 95% per-file coverage thresholds unless `thresholds` overrides an axis; `@/` is `<root>/src`. |
| `@rxova/repo-config/eslint`             | `baseEslintConfig({ tsconfigRootDir, consoleAllowed, ignores }, ...extra)`: `strictTypeChecked`, no relative imports.                                                                                          |
| `@rxova/repo-config/commitlint`         | Conventional Commits with no length limits, plus `rename`.                                                                                                                                                     |
| `@rxova/repo-config/prettier`           | `singleQuote`, `printWidth: 100`.                                                                                                                                                                              |
| `@rxova/repo-config/tsconfig.base.json` | Strict TypeScript for ESM libraries: `bundler` resolution, `verbatimModuleSyntax`, `noEmit`.                                                                                                                   |

```js
// eslint.config.js
import { baseEslintConfig } from '@rxova/repo-config/eslint';
export default baseEslintConfig({ tsconfigRootDir: import.meta.dirname });

// vitest.config.ts
import { baseVitestConfig } from '@rxova/repo-config/vitest';
export default baseVitestConfig({ root: import.meta.dirname });

// vitest.config.ts, with a package's own bar: the axes not named stay at 95
export default baseVitestConfig({
  root: import.meta.dirname,
  coverageInclude: ['src/**/*.ts'],
  exclude: ['src/cli.ts'], // the argv shell, covered by the e2e suite
  thresholds: { branches: 88, functions: 100 },
});

// commitlint.config.js
export { default } from '@rxova/repo-config/commitlint';
```

```json
// .prettierrc
"@rxova/repo-config/prettier"
```

```json
// tsconfig.json
{ "extends": "@rxova/repo-config/tsconfig.base.json", "include": ["src"] }
```

The eslint and commitlint presets ship as plain JavaScript. Hooks load them before anything is
built. Their tools are optional peer dependencies: install the ones you use.

## License

MIT

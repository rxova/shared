<h1 align="center">@rxova/repo-config</h1>

<p align="center">The verify gate, the release scripts and the build, test, lint and commit presets of an rxova monorepo, in one dev dependency.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@rxova/repo-config"><img src="https://img.shields.io/npm/v/@rxova/repo-config?color=cb3837&logo=npm&logoColor=white" alt="npm version" /></a>
  <a href="https://github.com/rxova/shared/actions/workflows/ci.yml"><img src="https://github.com/rxova/shared/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A522.13-5fa04e?logo=nodedotjs&logoColor=white" alt="Node.js 22.13 or newer" />
  <img src="https://img.shields.io/badge/pnpm%20%2B%20Turborepo-%E2%9C%93-f69220" alt="Made for pnpm and Turborepo" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#commands">Commands</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#presets">Presets</a> ·
  <a href="#programmatic-use">Programmatic use</a>
</p>

Every repository ends up with the same scripts: a pre-push gate, a changeset check, a tarball
smoke test, a Node floor for CI. Copied, they drift. Here they are one bin, `rxova-repo-config`,
read their settings from `repoConfig` in `package.json`, and sit beside one preset per tool, so a
repository's differences are options rather than forks.

```console
$ pnpm exec rxova-repo-config verify --only lint,format
verify: [1/2] lint
$ turbo run eslint:check
…
verify: [2/2] format
$ turbo run prettier:check
…
verify: all checks passed
```

## What you get

|                       |                                                                                                                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🚦 **Verify gate**    | `verify` runs CI's checks in CI's order and stops at the first failure (or, with `--keep-going`, reports them all); `pre-push` is the whole `.husky/pre-push` hook.                                   |
| 📝 **Changesets**     | `check-changeset` requires one when a published package changed; `lint-changesets`, `add-changeset` and `version` keep the changelog and lockfile right; `version-pr` opens the version pull request. |
| 📦 **Tarball checks** | `pack-smoke` installs the packed tarball and loads it; `check-exports` runs publint and attw; `post-publish-smoke` loads what npm serves after a release.                                             |
| 📚 **Docs checks**    | `check-llms`, `check-tsdoc`, `check-banned` and `check-snippets` hold `llms.txt`, TSDoc, docs and README snippets to the source.                                                                      |
| 🤖 **CI helpers**     | `check-scope`, `node-floor`, `check-majors`, `list-packages`, `dependabot-update-type` and `coverage-summary` write what a workflow needs to `GITHUB_OUTPUT` or the job summary.                      |
| 🧰 **Presets**        | ESLint, Prettier, lint-staged, commitlint, changelog, tsdown, Vitest, Playwright, Knip and four tsconfigs.                                                                                            |
| 🔌 **Optional peers** | Every tool is an optional peer dependency: install the ones you use. `prettier-plugin-astro` is the only dependency.                                                                                  |

## Install

Add it once, to the repository root:

```sh
pnpm add -D -w @rxova/repo-config
```

In an rxova repository `@rxova/repo-config` is declared only in the root `package.json`, never in a
workspace package: its presets and scripts run from the root, and a single copy keeps every package
on the same rules.

Then install the tools for the presets and commands you use. They are optional peers, so nothing
you do not use is pulled in:

| You use                                       | Install                                                                      |
| --------------------------------------------- | ---------------------------------------------------------------------------- |
| `@rxova/repo-config/eslint`                   | `eslint`, `@eslint/js`, `typescript-eslint`, `globals`, `typescript`         |
| … with `react`                                | `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y` |
| … with `astro`                                | `eslint-plugin-astro`                                                        |
| `@rxova/repo-config/prettier`                 | `prettier` (`prettier-plugin-astro` comes with this package)                 |
| `@rxova/repo-config/lint-staged`              | `lint-staged`, plus the ESLint and Prettier presets it runs                  |
| `@rxova/repo-config/commitlint`               | `@commitlint/cli`, `@commitlint/config-conventional`                         |
| `@rxova/repo-config/changelog`                | `@changesets/cli`, `@changesets/changelog-github`                            |
| `@rxova/repo-config/tsdown`                   | `tsdown`                                                                     |
| `@rxova/repo-config/vitest`                   | `vitest`, `@vitest/coverage-v8` (unless `coverage: false`)                   |
| `@rxova/repo-config/playwright`               | `@playwright/test`                                                           |
| `@rxova/repo-config/knip`                     | `knip`                                                                       |
| `check-exports`                               | `publint`, `@arethetypeswrong/cli`                                           |
| `check-llms`, `check-tsdoc`, `check-snippets` | `typescript`                                                                 |

## Quick start

Point the root scripts and the git hook at the bin:

```json
{
  "scripts": {
    "verify": "rxova-repo-config verify"
  }
}
```

```sh
# .husky/pre-push
pnpm exec rxova-repo-config pre-push
```

And each tool at its preset:

```js
// eslint.config.js
import { rxova } from "@rxova/repo-config/eslint";

export default rxova({ tsconfigRootDir: import.meta.dirname, node: true, tests: true });
```

```js
// lint-staged.config.js
export { default } from "@rxova/repo-config/lint-staged";
```

```js
// commitlint.config.js
export { default } from "@rxova/repo-config/commitlint";
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

```ts
// packages/<name>/tsdown.config.ts, a React component package
import { defineConfig } from "tsdown";
import { reactBuildConfig } from "@rxova/repo-config/tsdown";

export default defineConfig(reactBuildConfig({ banner: { js: "'use client';" } }));
```

```ts
// packages/<name>/vitest.config.ts
import { baseVitestConfig } from "@rxova/repo-config/vitest";

export default baseVitestConfig({ root: import.meta.dirname });
```

With no `repoConfig.verify.steps`, `verify` runs the default gate, in CI's order:

| Step                  | Runs                                  |
| --------------------- | ------------------------------------- |
| `lint`                | `pnpm lint`                           |
| `format`              | `pnpm format:check`                   |
| `build`               | `pnpm exec turbo run build`           |
| `typecheck`           | `pnpm exec turbo run typecheck`       |
| `unit tests`          | `pnpm exec turbo run test`            |
| `package exports`     | `pnpm run check:exports`              |
| `pack smoke`          | `pnpm run pack:smoke`                 |
| `dependency versions` | `pnpm run sherif:check`               |
| `unused code`         | `pnpm run knip:check`                 |
| `dependency dedupe`   | `pnpm exec turbo run //#dedupe:check` |
| `audit`               | `pnpm run audit:check`                |

So the root `package.json` needs those scripts, or its own `verify.steps`. `--only "unit tests"`
picks steps by name.

## Commands

`rxova-repo-config --help` lists them; `--version` prints the package version. Run each from the
repository root, except `pack-smoke` and `check-exports`, which run from a package directory.

| Command                                                | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rxova-repo-config verify [--only a,b] [--keep-going]` | Runs the pre-push gate in order and stops at the first failure. The steps come from `repoConfig.verify.steps`, or the default list above. `--only` runs the named steps. `--keep-going` runs every step, still in order, then lists each failed step and its command and exits 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rxova-repo-config pre-push [--only a,b]`              | The whole `.husky/pre-push` hook: a push that only deletes refs verifies nothing, any other push runs `verify`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rxova-repo-config check-changeset`                    | Fails when a published package changed and no changeset was added, or when an added changeset would break the changelog. Reads `BASE_SHA`, `HEAD_SHA`, `PR_LABELS`, `PR_TITLE`; with `PR_NUMBER` set it reads the pull request's current labels through `gh` instead of `PR_LABELS`, falling back to `PR_LABELS` when that fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rxova-repo-config lint-changesets`                    | Fails a waiting changeset with a summary line `@changesets/changelog-github` reads as metadata (`commit:`, `pr:`, `author:`), and, with `singlePackage`, one naming two packages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rxova-repo-config add-changeset <pkg> <bump> <…>`     | Writes a one-package changeset without the prompt. `<pkg>` is a name, a name without its scope, or a directory. `--help` lists the packages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `rxova-repo-config version`                            | The release `version` script: `changeset version`, the root version synced from `changeset.syncRootVersionFrom`, then `pnpm install --lockfile-only`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `rxova-repo-config version-pr`                         | With pending changesets: `git switch -C` to `VERSION_BRANCH` (default `changeset-release/<base>`), runs `VERSION_SCRIPT` (default `pnpm exec changeset version`), commits as `COMMIT_MESSAGE` (default `chore: version packages`), force-pushes, then edits the open pull request from that branch into the base or creates one, titled `PR_TITLE` (default `chore: version packages`), with a body listing each package whose version moved. The base is `BASE_BRANCH`, else the checked-out branch. Writes `pull-request` (the number, or empty) and `changed=true\|false` to `GITHUB_OUTPUT`. Publishes nothing.                                                                                                                                                                                                                                                                                                                          |
| `rxova-repo-config fix-lockfile`                       | Repairs `pnpm-lock.yaml` after a bump that only edited a manifest (Dependabot in a pnpm workspace): `pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts`, then `pnpm dedupe --ignore-scripts`. Writes `changed=true` when `git status` shows `pnpm-lock.yaml` differs from the commit (an earlier install's edits included), else `changed=false`, to `GITHUB_OUTPUT`; exits 1 when pnpm or git fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `rxova-repo-config dependabot-update-type`             | Reads Dependabot's metadata from the first commit of `BASE_SHA..HEAD_SHA` and writes `update-type` (`version-update:semver-major`, `-minor` or `-patch`, the highest of a group; empty without metadata) and `dependency-names` (comma-separated) to `GITHUB_OUTPUT`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `rxova-repo-config init [--dry-run]`                   | Run once in a repository just created from a template: renames the template (the repository `package.json` points at) to this one in every tracked file, moves `packages/example` to `packages/<repo>`, copies the template's labels, runs Prettier on the files it rewrote and turns GitHub Pages on, then prints the npm steps left. In a private repository it adds a changeset for the renamed package, turns on auto-merge and head-branch deletion instead of Pages, adds the repository to the `rxova-bot` installation on the owner organisation (or prints the manual step and opens the installation page in a browser; a classic personal access token with `repo` scope in `GH_TOKEN` lets it do this, the default `gh` login does not), and prints only what is still missing of the `RXOVA_APP_ID` and `RXOVA_APP_PRIVATE_KEY` secrets (Actions and Dependabot) and the `all checks` required check, instead of the npm steps. |
| `rxova-repo-config check-scope`                        | Writes `code-changed` (`false` for a release commit or a documentation-only range, see [Scope](#scope)), `docs-only` and `docs-changed` to `GITHUB_OUTPUT`. Always exits 0.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `rxova-repo-config check-majors`                       | Fails when the published packages (or `majors.packages`) are not on one major version.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `rxova-repo-config node-floor`                         | Writes `version` (the single `engines.node` floor all published packages share) and `packages` to `GITHUB_OUTPUT`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `rxova-repo-config pack-smoke [dir]`                   | Packs the package, installs it in a scratch project, loads it, runs its bins and checks the tarball: see [Pack smoke](#pack-smoke).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `rxova-repo-config check-exports [--profile p]`        | `publint --strict`, then `attw --pack .` with the profile from the flag or the package's `repoConfig.exports.profile`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `rxova-repo-config post-publish-smoke`                 | After a release, waits for npm to serve each version in `PUBLISHED_PACKAGES` (`postPublish.registryTimeoutMinutes`, 10 by default), installs them into a scratch project and loads them through `import` and `require`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `rxova-repo-config check-llms [root]`                  | Checks each published `llms.txt`: title, summary, sections, `files`, and its table against the source. See [llms.txt](#llmstxt).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `rxova-repo-config check-tsdoc`                        | Fails a callable export of a published package's entry that has no TSDoc summary.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rxova-repo-config check-banned`                       | Fails a hand-written doc or README that names a removed API from `docs.banned`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `rxova-repo-config check-snippets`                     | Fails a `ts`, `tsx`, `js` or `jsx` fence in the READMEs and `llms.txt` files that does not parse.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rxova-repo-config check-test-scripts`                 | Fails a workspace that has a `vitest.config.*` and no `test` script, which no Turborepo task would run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `rxova-repo-config check-file-size`                    | Fails a tracked file over `fileSize.max` lines; the `fileSize.allow` list only shrinks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `rxova-repo-config coverage-summary [path]`            | Appends the totals of `coverage/coverage-summary.json` (the `json-summary` reporter) to `GITHUB_STEP_SUMMARY`, or prints them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `rxova-repo-config list-packages [--marker key]`       | Prints `dirs=<json>` and `dirs_list=<words>` for a CI matrix: the published packages, or those whose manifest sets `key`. `--github-output` appends to `GITHUB_OUTPUT`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

Published packages are the directories under `packages/` whose manifest is not `private`. Nothing
needs to be listed by hand.

The reusable workflows in [rxova/shared](https://github.com/rxova/shared/tree/main/.github/workflows)
call the bin for you: `commit-messages.yml` runs `check-scope`, `changeset-gate.yml` runs
`check-changeset`, and `node-floor-smoke.yml` runs `node-floor` and `pack-smoke`. The first two
take a `repo-config-command` input, `pnpm exec rxova-repo-config` by default.

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

| Key    | Effect                                                                                                                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `load` | `auto` (default) imports the package when it has a JavaScript entry. `never` skips the probe, for a package that ships TypeScript or Astro sources.      |
| `bins` | Replaces a bin's `--version` check with `args` and the text it must print (on stdout or stderr; semver when `expect` is unset). `false` runs no bin.     |
| `run`  | Writes each `fixture` into the scratch project, runs the installed bin, and checks the fixture (or the output, without one) holds every `expect` string. |

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

| Key                                  | Read by                              | Default                                                                                                                                                                                                                                                                               |
| ------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `verify.steps`                       | `verify`, `pre-push`                 | The default gate under [Quick start](#quick-start). A list replaces it entirely.                                                                                                                                                                                                      |
| `changeset.singlePackage`            | `check-changeset`, `lint-changesets` | `false`. `true` requires each changeset to name exactly one package.                                                                                                                                                                                                                  |
| `changeset.scope`                    | `check-changeset`                    | `code`: a package's code changed, markdown and tests aside. `shipped`: anything its tarball ships.                                                                                                                                                                                    |
| `changeset.roots`                    | `add-changeset`                      | `["packages", "apps"]`                                                                                                                                                                                                                                                                |
| `changeset.aliasPrefix`              | `add-changeset`                      | None. `journey-` lets `core` name `@rxova/journey-core`.                                                                                                                                                                                                                              |
| `changeset.includePrivate`           | `add-changeset`, `check-changeset`   | `false`: private packages are neither offered nor required to have a changeset. `true` offers them to `add-changeset` and makes `check-changeset` require a changeset when one changes (unless the PR is labelled `skip-changeset`), for a repository whose packages are all private. |
| `changeset.syncRootVersionFrom`      | `version`                            | None: the root version is left alone.                                                                                                                                                                                                                                                 |
| `majors.packages`                    | `check-majors`                       | Every published package.                                                                                                                                                                                                                                                              |
| `tsdoc.entries`, `tsdoc.exclude`     | `check-tsdoc`                        | `packages/<dir>/src/index.ts`; no exclusions.                                                                                                                                                                                                                                         |
| `docs.root`                          | `check-banned`                       | `apps/docs/src/content/docs`                                                                                                                                                                                                                                                          |
| `docs.banned`                        | `check-banned`                       | None. `{ name, pattern, flags? }`, `pattern` a regex source.                                                                                                                                                                                                                          |
| `docs.allow`, `docs.exclude`         | `check-banned`                       | None. Globs under `docs.root`: allowed to name a banned API, or not scanned at all.                                                                                                                                                                                                   |
| `docs.readmes`                       | `check-banned`                       | `true`: the root README and every `packages/<dir>/README.md` are scanned too.                                                                                                                                                                                                         |
| `snippets.include`                   | `check-snippets`                     | `["README.md", "packages/*/README.md", "packages/*/llms.txt"]`: globs, files, directories.                                                                                                                                                                                            |
| `snippets.skipInfo`                  | `check-snippets`                     | `["live"]`: a fence whose info string holds one of these words is skipped.                                                                                                                                                                                                            |
| `packages.marker`                    | `list-packages`                      | None: the published packages.                                                                                                                                                                                                                                                         |
| `postPublish.importPattern`          | `post-publish-smoke`                 | None: every published package is imported. A regex source.                                                                                                                                                                                                                            |
| `postPublish.peers`                  | `post-publish-smoke`                 | None. Installed beside the packages, the way a consumer provides peers.                                                                                                                                                                                                               |
| `postPublish.registryTimeoutMinutes` | `post-publish-smoke`                 | `10`. How long to wait for npm to serve each published version before failing.                                                                                                                                                                                                        |
| `llms`                               | `check-llms`                         | See [llms.txt](#llmstxt).                                                                                                                                                                                                                                                             |
| `scope.ignore`                       | `check-scope`                        | `["**/*.md", "**/*.mdx"]`: documentation, see [Scope](#scope).                                                                                                                                                                                                                        |
| `scope.keep`                         | `check-scope`                        | `packages/*/*/**` and test and fixture folders: code even where `ignore` matches.                                                                                                                                                                                                     |
| `scope.site`                         | `check-scope`                        | `["apps/docs/**"]`: the docs site, reported as `docs-changed`.                                                                                                                                                                                                                        |
| `testScripts.globs`                  | `check-test-scripts`                 | `["packages/*", "apps/*"]`                                                                                                                                                                                                                                                            |
| `fileSize.max`                       | `check-file-size`                    | `500` lines.                                                                                                                                                                                                                                                                          |
| `fileSize.extensions`                | `check-file-size`                    | `ts`, `tsx`, `js`, `mjs`, `cjs`, `astro`, `css`, `yaml`, `yml`, `json`                                                                                                                                                                                                                |
| `fileSize.ignore`                    | `check-file-size`                    | `["pnpm-lock.yaml"]`                                                                                                                                                                                                                                                                  |
| `fileSize.allow`                     | `check-file-size`                    | None. Files over the limit today; an allowed file back under the limit fails.                                                                                                                                                                                                         |

A full example:

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
    "scope": {
      "ignore": ["**/*.md", "**/*.mdx"],
      "keep": ["packages/*/*/**"],
      "site": ["docs/**"]
    },
    "testScripts": { "globs": ["packages/*", "apps/*"] },
    "fileSize": { "max": 500, "ignore": ["pnpm-lock.yaml"], "allow": [] }
  }
}
```

- `verify.steps[].skipOnRelease` skips a step on the release pull request
  (`GITHUB_HEAD_REF=changeset-release/main`). On GitHub Actions each step folds into its own log
  group.
- With `changeset.scope: "shipped"`, a README or `llms.txt` edit needs a changeset too; `src/` and
  `tsdown.config.*` count when `files` lists `dist`.
- `add-changeset` leaves out the packages in `.changeset/config.json#ignore`.

### Scope

`check-scope` tells CI which jobs a range needs. It writes `code-changed=false`, and the build,
test and package jobs gated on it skip, when every changed file is one of:

- release bookkeeping: a changeset, a changelog, or a `package.json` whose only edit is its version;
- documentation: a path `scope.ignore` matches and `scope.keep` does not, that the range did not
  delete (a check may expect the file, as `pack-smoke` expects a README).

The default `keep` leaves Markdown below a package's top level (content a package ships, which its
tests read) and in test and fixture folders counted as code; a package's README stays
documentation. `llms.txt` is not Markdown, so an edit to it runs everything. `docs-only=true`
marks a documentation range, for a light job such as `docs-checks.yml` (formatting, plus
`check-snippets` or `check-banned` where a repository runs them), and `docs-changed=true` a range
that touched `scope.site`, so the docs site still builds. A range that cannot be read runs
everything, and `"ignore": []` turns the documentation skip off.

## Presets

One preset per tool. Repository differences are options, not copies.

| Import                                   | Use                                                                                                                                                                    |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@rxova/repo-config/eslint`              | `rxova(options, ...extra)`: the flat config, see [ESLint](#eslint).                                                                                                    |
| `@rxova/repo-config/prettier`            | Semicolons, double quotes, `printWidth: 100`, `trailingComma: "all"`, `arrowParens: "always"`, with `prettier-plugin-astro` built in for `*.astro`.                    |
| `@rxova/repo-config/lint-staged`         | ESLint (`--fix --no-warn-ignored`) then Prettier over staged code (`.astro` included), Prettier over JSON, CSS, SCSS, Markdown, MDX, YAML and HTML.                    |
| `@rxova/repo-config/tsdown`              | `baseBuildConfig`, `dualBuildConfig`, `reactBuildConfig`: see [tsdown](#tsdown).                                                                                       |
| `@rxova/repo-config/vitest`              | `baseVitestConfig(options)`: 95% per-file coverage; `@/` is `<root>/src`; see [Vitest](#vitest).                                                                       |
| `@rxova/repo-config/playwright`          | `basePlaywrightConfig(options)` and `astroPreview(port)`; see [Playwright](#playwright).                                                                               |
| `@rxova/repo-config/knip`                | `baseKnipConfig(options)`; see [Knip](#knip).                                                                                                                          |
| `@rxova/repo-config/commitlint`          | `@commitlint/config-conventional` with no length limits, plus the `rename` type.                                                                                       |
| `@rxova/repo-config/changelog`           | `@changesets/changelog-github` without the "Thanks @user!" line; the pull-request and commit links stay.                                                               |
| `@rxova/repo-config/tsconfig.base.json`  | Strict TypeScript for ESM libraries: ES2023, no DOM, `bundler` resolution, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noEmit`. |
| `@rxova/repo-config/tsconfig.dom.json`   | The base plus `DOM` and `DOM.Iterable`.                                                                                                                                |
| `@rxova/repo-config/tsconfig.react.json` | The dom preset plus `jsx: "react-jsx"`.                                                                                                                                |
| `@rxova/repo-config/tsconfig.node.json`  | Scripts Node runs with type stripping: `NodeNext`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, Node types.                                                     |

The presets that ESLint, Prettier, lint-staged, changesets and the commit hook load before anything
is built ship as plain JavaScript, so they work in a fresh clone.

### ESLint

`rxova(options, ...extra)` returns a flat config: `@eslint/js` recommended, typescript-eslint
`recommendedTypeChecked` with `projectService` on `.ts`/`.tsx`/`.mts`/`.cts`, and these rules on
TypeScript: `no-unused-vars` (`_`-prefixed arguments allowed), `consistent-type-imports` (inline
fixes), `no-explicit-any` and `no-console`. Build output, caches, `.claude/`, test reports and tool
config files (`*.config.*`, `knip.*`) are ignored. There are no formatting, import-path or
project-structure rules: add them through `rules`, `extends` or `extra`.

| Option            | Default | Effect                                                                                                                                                                               |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tsconfigRootDir` | —       | Required: `import.meta.dirname`.                                                                                                                                                     |
| `strict`          | `false` | `strictTypeChecked` instead of `recommendedTypeChecked`.                                                                                                                             |
| `react`           | `false` | `true` or `{ files, hooks, a11y, additionalHooks, version }`: eslint-plugin-react (+ JSX runtime), react-hooks and jsx-a11y, on `**/*.{tsx,jsx}` unless `files` widens it.           |
| `astro`           | `false` | eslint-plugin-astro `recommended`, browser globals and the tsconfig root pinned on `.astro` files.                                                                                   |
| `node`, `browser` | `false` | Globals on every file (`true`) or on the given globs.                                                                                                                                |
| `tests`           | `false` | `true` or `{ files }`: vitest, jest, browser and Node globals and the test relaxations (`no-unsafe-*`, `no-non-null-assertion`, `no-console`, …) on test files, fixtures and `e2e/`. |
| `ignores`         | `[]`    | Global ignores added to the defaults.                                                                                                                                                |
| `consoleAllowed`  | `[]`    | Globs where `no-console` is off: CLIs and scripts.                                                                                                                                   |
| `extends`         | `[]`    | Configs merged into the TypeScript block, below the relaxations: `[tseslint.configs.stylisticTypeChecked]`.                                                                          |
| `rules`           | `{}`    | Rules for TypeScript files, after the layers and before the test and console relaxations.                                                                                            |

`react` as an object: `hooks` and `a11y` default to `true`; `additionalHooks` is a regex source for
custom effect hooks that `exhaustive-deps` checks; `version` defaults to the `react` the tsconfig
root resolves.

`extra` configs are appended last, so they win. Each layer loads its plugin only when it is on, and
names the package to install when it is missing.

**Migrating from `baseEslintConfig`** (deprecated, removed in 0.4.0). This keeps the 0.2 behaviour:

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

### tsdown

Each takes tsdown `UserConfig` overrides and returns the merged config. Pass `entry` as an object,
never an array, so the output names stay the ones the exports map points at.

| Preset                        | Builds                                                                                                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `baseBuildConfig(overrides)`  | `src/index.ts`, ESM only, `platform: "node"`, `target: "node22"`, `.js`/`.d.ts`, declarations on, `clean`.                                                       |
| `dualBuildConfig(overrides)`  | ESM + CJS, `platform: "neutral"`, `target: "es2020"`, tree-shaken, `.mjs`/`.cjs` with `.d.mts`/`.d.cts`.                                                         |
| `reactBuildConfig(overrides)` | `dualBuildConfig` with `react`, `react-dom` and the JSX runtimes never bundled, and `@rxova/ts-utils` the only dependency that may be. `deps` merges key by key. |

The `reactBuildConfig` whitelist is what keeps a component package dependency-free: helpers from
`@rxova/ts-utils` are inlined, and bundling anything else fails the build instead of shipping
quietly.

### Vitest

`baseVitestConfig(options)` runs `src/**/*.test.ts(x)` in Node, maps `@/` to `<root>/src`, and
measures v8 coverage over `src/**/*.{ts,tsx}` (tests, fixtures, `*.types.ts` and `src/index.ts`
left out) with a 95% per-file threshold on every axis.

| Option                                               | Default               | Effect                                                                                       |
| ---------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------- |
| `root`                                               | `process.cwd()`       | The package directory; `@/` maps to its `src/`.                                              |
| `environment`                                        | `"node"`              | `"jsdom"` or `"happy-dom"`, installed in the package.                                        |
| `include`, `testExclude`                             | `src/**/*.test.ts(x)` | Test discovery, and globs kept out of it.                                                    |
| `coverageInclude`, `exclude`                         | `src/**/*.{ts,tsx}`   | The files coverage measures, and extra exclusions.                                           |
| `thresholds`                                         | 95 per axis           | `{ statements, branches, functions, lines }` to override single axes; `false` reports only.  |
| `reporter`                                           | `["text", "lcov"]`    | Coverage reporters.                                                                          |
| `coverage`                                           | `true`                | `false` drops the coverage block.                                                            |
| `reportsDirectory`                                   | Vitest's              | Where coverage reports go.                                                                   |
| `plugins`, `dedupe`, `alias`                         | —                     | Vite plugins, packages resolved to one copy, more aliases after `@/`.                        |
| `testTimeout`, `hookTimeout`                         | Vitest's              | In milliseconds.                                                                             |
| `globals`, `setupFiles`, `fileParallelism`, `silent` | Vitest's              | Passed through when set.                                                                     |
| `browser`                                            | —                     | `{ include, instances, provider, headless?, name? }`: a browser project beside the unit one. |
| `unitName`                                           | `"unit"`              | The unit project's name when `browser` is set.                                               |

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

Every spec in `e2e/` runs in each browser as its desktop device, one worker by default. CI (`CI`
set, or `ci: true`) gets two retries, `forbidOnly`, the GitHub reporter and a fresh server; a local
run reuses a running server.

| Option                     | Default                                                         |
| -------------------------- | --------------------------------------------------------------- |
| `command`, `port`          | None: without `command`, specs hit `url` or `port` as they are. |
| `url`                      | `http://localhost:<port>`; wins over `port`.                    |
| `testDir`                  | `"e2e"`                                                         |
| `browsers`                 | `["chromium"]`                                                  |
| `testIgnore`, `projects`   | None; `projects` are appended.                                  |
| `ci`                       | `Boolean(process.env.CI)`                                       |
| `retries`                  | 2 on CI, 0 locally.                                             |
| `workers`, `fullyParallel` | `1`, `false`                                                    |
| `timeout`                  | Playwright's.                                                   |
| `webServerTimeout`         | 120 s                                                           |
| `reuseExistingServer`      | `true` locally, `false` on CI.                                  |
| `trace`, `screenshot`      | `"retain-on-failure"`, `"only-on-failure"`                      |
| `reporter`                 | `github` + `list` on CI, `list` locally.                        |
| `forbidOnly`               | `true` on CI.                                                   |
| `stdout`                   | `"pipe"`                                                        |
| `snapshotPathTemplate`     | Playwright's.                                                   |

`astroPreview(port)` is the `command` that serves an Astro build: `astro preview --port <port>
--ignore-lock`.

### Knip

```ts
// knip.config.ts
import { baseKnipConfig } from "@rxova/repo-config/knip";

export default baseKnipConfig({ ignoreDependencies: ["@arethetypeswrong/cli"] });
```

Config hints are errors. `docsApp` (default `apps/docs`, `false` when there is none) may depend on
`@rxova/brand`, which it reaches through CSS rather than an import. `ignoreDependencies`,
`ignoreBinaries` and `ignore` are passed through; `workspaces` merges into the defaults per
directory, list keys concatenated.

## Programmatic use

The root entry exports what the bin and the presets are built from: `isEntry`, `parseConfig`,
`readConfig`, `parsePackageConfig`, `readPackageConfig`, `defaultSteps`, `runSteps`, `selectSteps`,
`publishedDirs`, `touchesPackage`, `checkChangeset`, `isReleaseMetadata`, `decideScope`, `floorOf`,
`readPublished`, `decideFloor`, `binsOf`, `shippedFiles`, `packSmoke`, and the `RepoConfig`,
`PackageConfig`, `Step`, `LlmsConfig`, `PackageLlmsConfig`, `LlmsApi`, `BannedPattern`, `BinCheck`
and `FixtureRun` types. The subpath presets export their option types (`BaseVitestOptions`,
`BasePlaywrightOptions`, `BaseKnipOptions`, …) beside the functions.

## License

[MIT](LICENSE)

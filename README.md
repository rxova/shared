<p align="center">
  <img src="https://cdn.jsdelivr.net/npm/@rxova/brand@1/assets/rxova-logo-256.png" width="128" alt="rxova logo" />
</p>

<h1 align="center">rxova/shared</h1>

<p align="center">The packages, GitHub Actions, reusable workflows and Renovate preset every rxova repository builds on.</p>

<p align="center">
  <a href="https://github.com/rxova/shared/actions/workflows/ci.yml"><img src="https://github.com/rxova/shared/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A522.13-5fa04e?logo=nodedotjs&logoColor=white" alt="Node.js 22.13 or newer" />
  <img src="https://img.shields.io/badge/pnpm%20%2B%20Turborepo-%E2%9C%93-f69220" alt="Made for pnpm and Turborepo" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#packages">Packages</a> ·
  <a href="#ci-building-blocks">CI building blocks</a> ·
  <a href="#using-it-in-an-rxova-repo">Using it</a> ·
  <a href="#developing-this-repo">Developing</a> ·
  <a href="#docs">Docs</a>
</p>

Every repository ends up with the same helpers, the same verify gate, the same CI jobs and the same
Renovate rules. Copied, they drift. Here they live once: repositories depend on the packages and
call the actions and workflows by path, so a fix lands everywhere on the next install or run.

## Packages

| Package                                                | npm                                                                                                                                               | What it is                                                                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`@rxova/ts-utils`](packages/ts-utils/README.md)       | [![npm](https://img.shields.io/npm/v/@rxova/ts-utils?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rxova/ts-utils)       | Small, dependency-free runtime helpers, inlined at build time, plus a `/react` entry.                                                              |
| [`@rxova/repo-config`](packages/repo-config/README.md) | [![npm](https://img.shields.io/npm/v/@rxova/repo-config?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rxova/repo-config) | The `rxova-repo-config` bin (verify gate, changesets, scope, tarball and docs checks) and presets for ESLint, Prettier, tsconfig, Vitest and more. |
| [`@rxova/agent-kit`](packages/agent-kit/README.md)     | [![npm](https://img.shields.io/npm/v/@rxova/agent-kit?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rxova/agent-kit)     | 10 hooks, 51 skills and 25 agents for Claude Code and OpenCode, installed in profiles by `rxova-agent-kit`.                                        |
| [`@rxova/docs-kit`](packages/docs-kit/README.md)       | [![npm](https://img.shields.io/npm/v/@rxova/docs-kit?color=cb3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rxova/docs-kit)       | Markdown twins, `llms.txt` and the `check-md-routes` build check for an Astro Starlight docs site.                                                 |

Each package README lists every export, command and option.

## CI building blocks

### Composite actions

```yaml
- uses: rxova/shared/actions/setup-pnpm@main
```

| Action               | What it does                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `setup-pnpm`         | pnpm at the `packageManager` version and Node, with the store cached.                    |
| `turbo-cache`        | Restores and saves the local Turbo cache across runs.                                    |
| `turbo-remote-cache` | Points Turbo at a remote cache backed by the Actions cache.                              |
| `setup-playwright`   | Resolves, caches and installs Playwright browsers.                                       |
| `pin-react`          | Pins one React at the root and in the given packages, and proves only that one resolves. |
| `require-jobs`       | Fails unless every job in `needs` passed or was skipped: the one check to require.       |
| `notify-website`     | Tells the rxova.org website to publish this run's docs build.                            |

Inputs and examples: [actions/README.md](actions/README.md).

### Reusable workflows

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
```

| Workflow                    | What it does                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| `commit-messages.yml`       | The root CI job: lints commits and outputs `code-changed`, `docs-only` and `docs-changed`.    |
| `docs-checks.yml`           | The light job a documentation-only range runs instead of the build and test matrix.           |
| `lint-pr-title.yml`         | Lints the PR title, which becomes the squash subject.                                         |
| `changeset-gate.yml`        | Requires a changeset when a pull request changes a published package.                         |
| `react-minimum-version.yml` | Builds, tests and typechecks against the oldest React a peer range allows.                    |
| `node-floor-smoke.yml`      | Installs each packed package on exactly the oldest Node its `engines` promises.               |
| `changesets-release.yml`    | The version pull request, then publishing with npm trusted publishing and provenance.         |
| `snapshot-release.yml`      | Publishes a prerelease under a dist-tag other than `latest`, to try a change in another repo. |

Inputs, outputs and a full CI graph: [.github/workflows/README.md](.github/workflows/README.md).

### Renovate preset

```json5
{ extends: ["github>rxova/shared//renovate/default.json5"] }
```

The org rules live in [renovate/default.json5](renovate/default.json5); a repository keeps only its
own.

## Using it in an rxova repo

Tooling packages go in the root `package.json` only, never in a workspace package:

```sh
pnpm add -D -w @rxova/repo-config @rxova/ts-utils
```

Point each tool at its preset:

```js
// eslint.config.js
import { rxova } from "@rxova/repo-config/eslint";

export default rxova({ tsconfigRootDir: import.meta.dirname, node: true, tests: true });
```

```json
// .prettierrc
"@rxova/repo-config/prettier"
```

```json
// tsconfig.json
{ "extends": "@rxova/repo-config/tsconfig.react.json", "include": ["src"] }
```

And CI at the shared workflows, pinned to `@main`:

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
  changeset:
    needs: [commitlint]
    uses: rxova/shared/.github/workflows/changeset-gate.yml@main
```

The [`@rxova/repo-config` quick start](packages/repo-config/README.md#quick-start) covers the rest:
the verify script, the pre-push hook, lint-staged, commitlint, tsdown and Vitest.

## Developing this repo

Node 22.13 or newer, and pnpm through Corepack:

```sh
corepack enable
pnpm install        # dependencies and git hooks
pnpm test           # unit tests, coverage enforced per file
pnpm docs           # the docs site (apps/docs) on a local dev server
pnpm run verify     # everything CI runs, in CI's order (also the pre-push hook)
pnpm changeset      # record a change to a published package
```

- **Releases.** A change to a published package needs a changeset (see
  [.changeset/README.md](.changeset/README.md)). Once CI is green on `main`,
  Changesets opens a `chore: version packages` pull request; merging it publishes to npm with
  trusted publishing and provenance.
- **Docs-only pull requests.** When a range changes only Markdown (and changesets), CI skips the
  build, test and package jobs and runs the light `docs checks` job instead; the docs site still
  builds when `apps/docs` changed.
- **Releasing a README-only change.** A package README change needs no changeset, but npm shows the
  README of the published version. To ship it, add a patch changeset; the range stays docs-only:

  ```sh
  pnpm exec rxova-repo-config add-changeset ts-utils patch "Rewrite the readme"
  ```

See [CONTRIBUTING.md](CONTRIBUTING.md) for hooks and commit rules, [SECURITY.md](SECURITY.md) to
report a vulnerability, and [SUPPORT.md](SUPPORT.md) for help.

## Docs

Every README in the repository:

- [`packages/ts-utils/README.md`](packages/ts-utils/README.md): `@rxova/ts-utils`
- [`packages/repo-config/README.md`](packages/repo-config/README.md): `@rxova/repo-config`
- [`packages/agent-kit/README.md`](packages/agent-kit/README.md): `@rxova/agent-kit`
- [`packages/docs-kit/README.md`](packages/docs-kit/README.md): `@rxova/docs-kit`
- [`actions/README.md`](actions/README.md): the composite actions
- [`.github/workflows/README.md`](.github/workflows/README.md): the reusable workflows
- [`.changeset/README.md`](.changeset/README.md): adding a changeset and how it is released

The documentation site's sources are in [`apps/docs`](apps/docs); `pnpm docs` serves it locally.

## License

[MIT](LICENSE)

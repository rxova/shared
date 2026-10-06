# Reusable workflows

Workflows other rxova repositories call with `uses:` at the job level:

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
```

They call the [composite actions](../../actions/README.md) as `rxova/shared/actions/<name>@main`.
This repository's own CI calls them by local path (`./.github/workflows/<name>.yml`), so a change to
a workflow runs on the pull request that makes it. The caller's workflow-level `env` does not reach
a called workflow, and a called workflow cannot hold more `permissions` than the calling job grants.

| Workflow                    | Inputs                                                                                                                                                                        | Outputs                                     | What it does                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit-messages.yml`       | `node-version`, `repo-config-command`, `check-scope`                                                                                                                          | `code-changed`, `docs-only`, `docs-changed` | The root CI job: lints the branch commits (or the pushed commit) and decides with `check-scope` what the range touched; `code-changed` is false for a release commit or a documentation-only range                        |
| `docs-checks.yml`           | `node-version`, `command`                                                                                                                                                     | —                                           | The light job for a documentation-only range (`docs-only`): `prettier --check .` by default, plus any prose checks the caller names                                                                                       |
| `lint-pr-title.yml`         | `node-version`                                                                                                                                                                | —                                           | Lints the PR title, read live from the API and piped to commitlint. Needs `pull-requests: read`                                                                                                                           |
| `repo-checks.yml`           | `node-version`, `build-command`, `actionlint`, `extra-command`, `repo-config-command`                                                                                         | —                                           | Lint, format check, actionlint over the workflows (official image, on by default), an optional extra check, build (docs left out), typecheck and `check-test-scripts`                                                     |
| `unit-tests.yml`            | `node-versions`, `operating-systems`, `test-command`, `coverage-node-version`, `coverage-os`; secret `CODECOV_TOKEN`                                                          | —                                           | The test suite on every Node × OS pair (22/24 × Linux/macOS/Windows by default), coverage uploaded to Codecov from one leg                                                                                                |
| `supply-chain.yml`          | `node-version`                                                                                                                                                                | —                                           | `audit:check`, `sherif:check`, `knip:check`, then `//#dedupe:check` last                                                                                                                                                  |
| `package-contract.yml`      | `node-version`                                                                                                                                                                | —                                           | `check:exports` (publint + attw) and `pack:smoke`                                                                                                                                                                         |
| `docs-build.yml`            | `node-version`, `build-command`                                                                                                                                               | —                                           | Builds the docs site at the Pages base path (`DOCS_URL`, `DOCS_BASE_URL`), so a root-only link fails on the pull request                                                                                                  |
| `pages-deploy.yml`          | `node-version`, `build-command`, `path`                                                                                                                                       | —                                           | Builds and deploys the docs to GitHub Pages; skipped on a template and until Pages is enabled. Needs `pages: write`, `id-token: write`                                                                                    |
| `codeql-analysis.yml`       | `languages`                                                                                                                                                                   | —                                           | CodeQL per language, skipped with a notice where code scanning is not enabled. Needs `security-events: write`, `actions: read`                                                                                            |
| `changeset-gate.yml`        | `node-version`, `repo-config-command`                                                                                                                                         | —                                           | `check-changeset` on pull requests (not the release branch), with the base/head SHAs, labels and title from the event                                                                                                     |
| `react-minimum-version.yml` | `react-version`, `test-command`, `types-version`, `types-dom-version`, `filters`, `build-command`, `typecheck-command`, `node-version`, `node-options`, `playwright-browsers` | —                                           | Pins the oldest React at the root and in `filters` (`pin-react`), then builds, tests and typechecks against it                                                                                                            |
| `node-floor-smoke.yml`      | `node-version`, `build-command`, `extra-command`                                                                                                                              | —                                           | Builds, reads the Node floor from `engines`, switches to it and runs `pack-smoke` for each published package with plain `node`                                                                                            |
| `changesets-release.yml`    | `enabled`, `version-script`, `publish-script`, `node-version`, `run-verify`, `turbo-cache`, `commit-message`, `pr-title`, `create-github-releases`, `push-git-tags`           | `published`, `published-packages`           | changesets/action: the version pull request, then publishing with npm trusted publishing and provenance                                                                                                                   |
| `changesets-version.yml`    | `version-script`, `node-version`, `commit-message`, `pr-title`, `repo-config-command`; secrets `RXOVA_APP_ID`, `RXOVA_APP_PRIVATE_KEY` (required)                             | —                                           | Versioning only: `version-pr` opens the version pull request as the rxova app, so CI runs on it; never publishes                                                                                                          |
| `snapshot-release.yml`      | `tag`, `node-version`, `verify-command`, `build-command`                                                                                                                      | —                                           | Publishes a `changeset version --snapshot` prerelease under a dist-tag other than `latest`, with no git tag                                                                                                               |
| `lean-verify.yml`           | `node-version`, `timeout-minutes`, `repo-config-command`, `check-scope`, `extra-command`                                                                                      | `code-changed`, `docs-only`, `docs-changed` | The whole CI in one job: the commit lint and `check-scope`, `verify --keep-going`, `check-test-scripts`, coverage kept as an artifact                                                                                     |
| `dependabot.yml`            | `node-version`, `repo-config-command`, `merge-method`; secrets `RXOVA_APP_ID`, `RXOVA_APP_PRIVATE_KEY`                                                                        | —                                           | On a Dependabot pull request: `fix-lockfile` refreshes and dedupes the lockfile and pushes it as the rxova app; `dependabot-update-type` reads the update type, and anything short of a major is approved and auto-merged |

`repo-config-command` defaults to `pnpm exec rxova-repo-config`; only rxova/shared, which builds the
bin, overrides it.

Gate jobs on `commit-messages.yml`'s outputs rather than on `paths-ignore`: a workflow that
`paths-ignore` skips never reports, so a required check it feeds stays pending, while a skipped job
passes `require-jobs`. A documentation-only range (see `repoConfig.scope` in the
[`@rxova/repo-config` README](../../packages/repo-config/README.md)) skips every job gated on
`code-changed`; gate a docs-site build on `code-changed == 'true' || docs-changed == 'true'` so
content changes still build it.

## Examples

A whole CI, every job a call. The caller keeps only the triggers, the `if:`
gates and the `all checks` gate:

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
  checks:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true'
    uses: rxova/shared/.github/workflows/repo-checks.yml@main
  test:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true'
    uses: rxova/shared/.github/workflows/unit-tests.yml@main
    secrets:
      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
  supply-chain:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true'
    uses: rxova/shared/.github/workflows/supply-chain.yml@main
  pack-smoke:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true'
    uses: rxova/shared/.github/workflows/package-contract.yml@main
  docs:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true' || needs.commitlint.outputs.docs-changed == 'true'
    uses: rxova/shared/.github/workflows/docs-build.yml@main
```

A CI graph with the release-side jobs:

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
  changeset:
    needs: [commitlint]
    uses: rxova/shared/.github/workflows/changeset-gate.yml@main
  compat:
    needs: [commitlint]
    if: needs.commitlint.outputs.code-changed == 'true'
    uses: rxova/shared/.github/workflows/node-floor-smoke.yml@main
  docs-checks:
    needs: [commitlint]
    if: needs.commitlint.outputs.docs-only == 'true'
    uses: rxova/shared/.github/workflows/docs-checks.yml@main
  react-minimum:
    needs: [commitlint]
    uses: rxova/shared/.github/workflows/react-minimum-version.yml@main
    with:
      react-version: 18.2.0
      types-version: 18.3.27
      types-dom-version: 18.3.7
      filters: "@rxova/journey-react"
      test-command: pnpm --workspace-root vitest run packages/react --coverage.enabled=false
      typecheck-command: pnpm --filter @rxova/journey-react typecheck
  gate:
    name: all checks
    if: always()
    needs: [commitlint, changeset, compat, docs-checks, react-minimum]
    runs-on: ubuntu-latest
    steps:
      - uses: rxova/shared/actions/require-jobs@main
        with:
          needs: ${{ toJSON(needs) }}
```

The PR title (in its own workflow, on `pull_request: { types: [opened, edited, reopened] }`):

```yaml
permissions:
  contents: read
  pull-requests: read
jobs:
  title:
    uses: rxova/shared/.github/workflows/lint-pr-title.yml@main
```

A release after CI goes green on main:

```yaml
on:
  workflow_run: { workflows: [CI], types: [completed], branches: [main] }
  workflow_dispatch:
jobs:
  release:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    permissions: { contents: write, pull-requests: write, id-token: write }
    uses: rxova/shared/.github/workflows/changesets-release.yml@main
    with:
      enabled: ${{ vars.RELEASE_ENABLED == 'true' }}
```

Repository-specific follow-ups (moving a tag, a GitHub release, a post-publish smoke) are jobs of
the caller that `needs: [release]` and read `needs.release.outputs.published`. A caller that cuts
its own GitHub release passes `create-github-releases: false`, so a version is not released twice.
The npm trusted publisher names a workflow file; after switching a repository to
`changesets-release.yml`, check that the first release publishes, and if npm rejects the token,
register the file npm reports.

## Private repositories

Private repositories pay for Actions minutes, so they run a lean shape: one `lean-verify.yml` job
instead of the public graph's dozen-plus, Dependabot instead of Renovate, and no npm publishing.
`lean-verify.yml` pays the checkout, pnpm setup and install once, and `verify --keep-going` reports
every failure in that one run. Past about 10 packages, or more than 10 minutes on a warm run, split
it into the public graph's parallel jobs or shard the tests.

`.github/workflows/ci.yml` — drafts are skipped, and run once marked ready:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review, labeled, unlabeled]
permissions:
  contents: read
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
jobs:
  verify:
    if: github.event.pull_request.draft != true
    uses: rxova/shared/.github/workflows/lean-verify.yml@main
  changeset:
    if: github.event.pull_request.draft != true
    uses: rxova/shared/.github/workflows/changeset-gate.yml@main
  gate:
    name: all checks
    if: always()
    needs: [verify, changeset]
    runs-on: ubuntu-latest
    steps:
      - uses: rxova/shared/actions/require-jobs@main
        with:
          needs: ${{ toJSON(needs) }}
```

`.github/workflows/dependabot-pr.yml`:

```yaml
name: Dependabot
on:
  pull_request:
    types: [opened, synchronize, reopened]
permissions:
  contents: read
jobs:
  dependabot:
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    permissions: { contents: write, pull-requests: write }
    uses: rxova/shared/.github/workflows/dependabot.yml@main
    secrets:
      RXOVA_APP_ID: ${{ secrets.RXOVA_APP_ID }}
      RXOVA_APP_PRIVATE_KEY: ${{ secrets.RXOVA_APP_PRIVATE_KEY }}
```

`.github/workflows/version.yml` — versioning only: `changesets-version.yml` opens the version pull
request as the app, so CI runs on it, and never publishes. A repository that publishes calls
`changesets-release.yml` instead; the two are separate so neither carries the other's switches.
`.changeset/config.json` needs `privatePackages: { version: true, tag: false }`:

```yaml
name: Version
on:
  workflow_run: { workflows: [CI], types: [completed], branches: [main] }
  workflow_dispatch:
permissions:
  contents: read
jobs:
  version:
    if: github.event_name == 'workflow_dispatch' || github.event.workflow_run.conclusion == 'success'
    permissions: { contents: write, pull-requests: write }
    uses: rxova/shared/.github/workflows/changesets-version.yml@main
    secrets:
      RXOVA_APP_ID: ${{ secrets.RXOVA_APP_ID }}
      RXOVA_APP_PRIVATE_KEY: ${{ secrets.RXOVA_APP_PRIVATE_KEY }}
```

`.github/dependabot.yml` — keep `cooldown` in step with pnpm's `minimumReleaseAge` (minutes there:
`4320` is 3 days), so Dependabot never proposes a version the install then refuses:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    cooldown: { default-days: 3 }
    groups:
      minor-and-patch: { update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: /
    schedule: { interval: weekly }
    cooldown: { default-days: 3 }
```

Before the first run:

- The rxova GitHub App is installed on the repository with contents and pull requests write.
- `RXOVA_APP_ID` and `RXOVA_APP_PRIVATE_KEY` are organization secrets twice over: as **Actions**
  secrets (the version workflow) and as **Dependabot** secrets (a run Dependabot starts reads only
  those).
- "Allow auto-merge" is on, and so is "Allow GitHub Actions to create and approve pull requests"
  (the approval comes from GITHUB_TOKEN).
- Branch protection on `main` requires the `all checks` status check, the one auto-merge waits for.

## Renovate

`renovate/default.json5` is the org preset. A repository's `.github/renovate.json5` extends it and
keeps only its own rules (the private repositories use Dependabot instead; see above):

```json5
{
  $schema: "https://docs.renovatebot.com/renovate-schema.json",
  extends: ["github>rxova/shared//renovate/default.json5"],
}
```

The `.json5` extension is part of the preset name. The preset carries the TypeScript `<7` ceiling
until typescript-eslint accepts TypeScript 7 — one place to lift it. There is no Dependabot preset:
Dependabot cannot extend a shared configuration, so each private repository carries its own
`.github/dependabot.yml`.

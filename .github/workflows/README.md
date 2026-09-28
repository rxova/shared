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

| Workflow                    | Inputs                                                                                                                                                                        | Outputs                                     | What it does                                                                                                                                                                                       |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commit-messages.yml`       | `node-version`, `repo-config-command`, `check-scope`                                                                                                                          | `code-changed`, `docs-only`, `docs-changed` | The root CI job: lints the branch commits (or the pushed commit) and decides with `check-scope` what the range touched; `code-changed` is false for a release commit or a documentation-only range |
| `docs-checks.yml`           | `node-version`, `command`                                                                                                                                                     | —                                           | The light job for a documentation-only range (`docs-only`): `prettier --check .` by default, plus any prose checks the caller names                                                                |
| `lint-pr-title.yml`         | `node-version`                                                                                                                                                                | —                                           | Lints the PR title, read live from the API and piped to commitlint. Needs `pull-requests: read`                                                                                                    |
| `repo-checks.yml`           | `node-version`, `build-command`, `actionlint`, `extra-command`, `repo-config-command`                                                                                         | —                                           | Lint, format check, actionlint over the workflows (official image, on by default), an optional extra check, build (docs left out), typecheck and `check-test-scripts`                              |
| `unit-tests.yml`            | `node-versions`, `operating-systems`, `test-command`, `coverage-node-version`, `coverage-os`; secret `CODECOV_TOKEN`                                                          | —                                           | The test suite on every Node × OS pair (22/24 × Linux/macOS/Windows by default), coverage uploaded to Codecov from one leg                                                                         |
| `supply-chain.yml`          | `node-version`                                                                                                                                                                | —                                           | `audit:check`, `sherif:check`, `knip:check`, then `//#dedupe:check` last                                                                                                                           |
| `package-contract.yml`      | `node-version`                                                                                                                                                                | —                                           | `check:exports` (publint + attw) and `pack:smoke`                                                                                                                                                  |
| `docs-build.yml`            | `node-version`, `build-command`                                                                                                                                               | —                                           | Builds the docs site at the Pages base path (`DOCS_URL`, `DOCS_BASE_URL`), so a root-only link fails on the pull request                                                                           |
| `pages-deploy.yml`          | `node-version`, `build-command`, `path`                                                                                                                                       | —                                           | Builds and deploys the docs to GitHub Pages; skipped on a template and until Pages is enabled. Needs `pages: write`, `id-token: write`                                                             |
| `codeql-analysis.yml`       | `languages`                                                                                                                                                                   | —                                           | CodeQL per language, skipped with a notice where code scanning is not enabled. Needs `security-events: write`, `actions: read`                                                                     |
| `changeset-gate.yml`        | `node-version`, `repo-config-command`                                                                                                                                         | —                                           | `check-changeset` on pull requests (not the release branch), with the base/head SHAs, labels and title from the event                                                                              |
| `react-minimum-version.yml` | `react-version`, `test-command`, `types-version`, `types-dom-version`, `filters`, `build-command`, `typecheck-command`, `node-version`, `node-options`, `playwright-browsers` | —                                           | Pins the oldest React at the root and in `filters` (`pin-react`), then builds, tests and typechecks against it                                                                                     |
| `node-floor-smoke.yml`      | `node-version`, `build-command`, `extra-command`                                                                                                                              | —                                           | Builds, reads the Node floor from `engines`, switches to it and runs `pack-smoke` for each published package with plain `node`                                                                     |
| `changesets-release.yml`    | `enabled`, `version-script`, `publish-script`, `node-version`, `run-verify`, `turbo-cache`, `commit-message`, `pr-title`                                                      | `published`, `published-packages`           | changesets/action: the version pull request, then publishing with npm trusted publishing and provenance                                                                                            |
| `snapshot-release.yml`      | `tag`, `node-version`, `verify-command`, `build-command`                                                                                                                      | —                                           | Publishes a `changeset version --snapshot` prerelease under a dist-tag other than `latest`, with no git tag                                                                                        |

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
the caller that `needs: [release]` and read `needs.release.outputs.published`. The npm trusted
publisher names a workflow file; after switching a repository to `changesets-release.yml`, check
that the first release publishes, and if npm rejects the token, register the file npm reports.

## Renovate

`renovate/default.json5` is the org preset. A repository's `.github/renovate.json5` extends it and
keeps only its own rules:

```json5
{
  $schema: "https://docs.renovatebot.com/renovate-schema.json",
  extends: ["github>rxova/shared//renovate/default.json5"],
}
```

The `.json5` extension is part of the preset name. The preset carries the TypeScript `<7` ceiling
until typescript-eslint accepts TypeScript 7 — one place to lift it. None of the rxova repositories
uses Dependabot, so there is no Dependabot preset.

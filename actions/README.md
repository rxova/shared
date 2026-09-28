# Shared GitHub Actions

Composite actions for rxova repositories. Reference them by path and ref:

```yaml
- uses: rxova/shared/actions/setup-pnpm@main
```

| Action               | Inputs                                                           | What it does                                                                                                                                |
| -------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `setup-pnpm`         | `node-version`, `registry-url`                                   | Installs pnpm at the `packageManager` version (the install itself is cached) and Node with the pnpm store cached                            |
| `turbo-cache`        | `key`                                                            | Restores and saves the local `.turbo` cache per job. Pass a distinct `key` per matrix leg                                                   |
| `turbo-remote-cache` | —                                                                | Points Turbo at a remote cache backed by the Actions cache, fetched and stored per task hash                                                |
| `setup-playwright`   | `browsers`, `working-directory`, `install-script`                | Installs Playwright browsers outside the checkout, cached by Playwright version and browser set                                             |
| `pin-react`          | `react-version`, `types-version`, `types-dom-version`, `filters` | Pins one exact React at the workspace root and in the filtered packages, then fails unless that React is the only one they resolve          |
| `require-jobs`       | `needs`                                                          | Fails unless every job in `needs` passed or was skipped: the single `all checks` context branch protection requires                         |
| `notify-website`     | `project`, `token`, `base`, `framework`, `repository`, `dry-run` | Sends the `docs` dispatch that tells rxova.org to publish this run's `docs-dist` artifact (rxova-website `docs/INPUTS-CONTRACT.md`, gate 1) |

This repository's own workflows use them through `./actions/<name>`, so a change here is tested by
its own CI before anyone else picks it up. Inputs stay backward compatible: a rename breaks every
workflow pinned to `@main`.

## `setup-playwright`

- `browsers` — space-separated, such as `chromium`. Empty installs every browser, or runs
  `install-script`.
- `working-directory` (default `.`) — where Playwright is installed. The version is resolved from
  there (`playwright`, then `@playwright/test`), so a workspace that only installs
  `@playwright/test` in `apps/e2e` passes `working-directory: apps/e2e`.
- `install-script` — a `package.json` script (such as `e2e:install`) that installs the full set,
  run when `browsers` is empty, so contributors and CI install the same browsers.

## `pin-react`

Run it after `pnpm install`, in a job that tests against the oldest React a peer range allows. It
runs `pnpm add -D -E` at the workspace root **and** in each filter, because a package declared at
the root (such as `@rxova/ts-utils`) resolves its `react` peer there: pinning only the package
under test leaves two Reacts, and every hook call fails. Then it resolves `react` and `react-dom`
from the root and from each pinned package — and from each of their dependencies that peers on
React — and fails naming any other version it finds. Versions are exact (`18.2.0`, not `^18.2.0`:
a range resolves to the newest 18). The reusable
[`react-minimum-version.yml`](../.github/workflows/README.md) wraps it.

```yaml
- run: pnpm install --frozen-lockfile
- uses: rxova/shared/actions/pin-react@main
  with:
    react-version: 18.2.0
    types-version: 18.3.27
    types-dom-version: 18.3.7
    filters: "@rxova/journey-react"
```

## `require-jobs`

```yaml
gate:
  name: all checks
  if: always()
  needs: [commitlint, checks, test]
  runs-on: ubuntu-latest
  steps:
    - uses: rxova/shared/actions/require-jobs@main
      with:
        needs: ${{ toJSON(needs) }}
```

`skipped` passes (a release commit, a documentation-only range, a push with no pull request); `failure` and `cancelled` do not.

## `notify-website`

Call it on main, in the job that uploaded the `docs-dist` artifact, after the upload:

```yaml
- uses: rxova/shared/actions/notify-website@main
  if: github.event_name != 'pull_request'
  with:
    project: overlock # base defaults to /packages/overlock/, framework to astro
    token: ${{ secrets.AGGREGATOR_DISPATCH_TOKEN }}
```

`schema` is sent as the number 1; `project`, `ref`, `sha`, `run_id`, `base` and `framework` as
strings. `dry-run: 'true'` prints the request instead of sending it.

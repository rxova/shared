# rxova shared

The code every rxova repository shares, in one place:

- runtime helpers (the org's "lodash");
- the repository-maintenance scripts and config presets;
- the composite GitHub Actions, reusable workflows and Renovate preset CI uses.

Each repository depends on these instead of keeping its own copy.

| Piece                  | What it is                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/ts-utils`    | [`@rxova/ts-utils`](packages/ts-utils/README.md): small dependency-free runtime helpers (predicates, safe reflection, errors, equality, environment, dev warnings, DOM, ids, escaping, freeze, clamp) and a `/react` entry (refs, media queries, dev warnings)                                                                                           |
| `packages/docs-kit`    | [`@rxova/docs-kit`](packages/docs-kit/README.md): the agent-facing surfaces of a Starlight docs site (`.md` twins, `llms.txt`, `llms-full.txt`, doc-relative link rewriting) and the `rxova-docs-kit check-md-routes` build check                                                                                                                        |
| `packages/repo-config` | [`@rxova/repo-config`](packages/repo-config/README.md): the `rxova-repo-config` bin (verify, changeset gate, release-commit scope, Node floor, pack smoke, llms.txt check) and the tsdown, vitest, eslint, commitlint and prettier presets                                                                                                               |
| `packages/agent-kit`   | [`@rxova/agent-kit`](packages/agent-kit/README.md): a kit for Claude Code and OpenCode, installed in profiles (`core`, `hackathon`, `dotnet`, `full`) by the `rxova-agent-kit` bin: 10 hooks (6 guards, format-and-lint on edit, session snapshots, handoff reminders, context nudges), 34 skills (including .NET 10 upgrades and Datadog) and 18 agents |
| `actions/`             | [Composite GitHub Actions](actions/README.md): `setup-pnpm`, `turbo-cache`, `turbo-remote-cache`, `setup-playwright`, `pin-react`, `require-jobs`, `notify-website`                                                                                                                                                                                      |
| `.github/workflows/`   | [Reusable workflows](.github/workflows/README.md): commit messages, PR title, changeset gate, React minimum version, Node floor smoke, changesets release, snapshot release                                                                                                                                                                              |
| `renovate/`            | The org Renovate preset, `github>rxova/shared//renovate/default.json5`                                                                                                                                                                                                                                                                                   |
| `apps/docs`            | Astro Starlight documentation, deployed to GitHub Pages                                                                                                                                                                                                                                                                                                  |

## Using it

```sh
pnpm add -D @rxova/ts-utils @rxova/repo-config
```

```yaml
- uses: rxova/shared/actions/setup-pnpm@main
```

```yaml
jobs:
  commitlint:
    uses: rxova/shared/.github/workflows/commit-messages.yml@main
```

The package READMEs list every export, command and input.

## Releasing

Changesets opens a version pull request, and merging it publishes to npm with trusted publishing
and provenance. To enable publishing:

1. Publish each package's first version by hand.
2. Add a trusted publisher on npmjs.com (repository `rxova/shared`, workflow `release.yml`).
3. Set the repository variable `RELEASE_ENABLED` to `true`.

## Commands

```sh
pnpm install        # dependencies and git hooks
pnpm test           # unit tests, coverage enforced per file
pnpm docs           # docs dev server
pnpm run verify     # everything CI runs, in order
pnpm changeset      # record a change to a published package
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the rest.

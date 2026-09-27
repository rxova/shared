# rxova shared

The code every rxova repository shares, in one place:

- runtime helpers (the org's "lodash");
- the repository-maintenance scripts and config presets;
- the composite GitHub Actions CI uses.

Each repository depends on these instead of keeping its own copy.

| Piece              | What it is                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/toolbox` | [`@rxova/toolbox`](packages/toolbox/README.md): small dependency-free runtime helpers (predicates, safe reflection, errors, equality, dev warnings, DOM, freeze, clamp) and a `/react` entry                                                |
| `packages/tooling` | [`@rxova/tooling`](packages/tooling/README.md): the `rxova-tooling` bin (verify, changeset gate, release-commit scope, Node floor, pack smoke, llms.txt check, page bundle) and the tsdown, vitest, eslint, commitlint and prettier presets |
| `actions/`         | [Composite GitHub Actions](actions/README.md): `setup-pnpm`, `turbo-cache`, `turbo-remote-cache`, `setup-playwright`                                                                                                                        |
| `apps/docs`        | Astro Starlight documentation, deployed to GitHub Pages                                                                                                                                                                                     |

## Using it

```sh
pnpm add -D @rxova/toolbox @rxova/tooling
```

```yaml
- uses: rxova/shared/actions/setup-pnpm@main
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

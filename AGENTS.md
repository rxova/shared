# Agent guide

pnpm + Turborepo monorepo. Node >= 22.13. TypeScript everywhere, ESM only.

## Layout

- `packages/*` — published npm packages (each one needs a changeset when it changes).
- `packages/tooling` — `@rxova/tooling`: the repo scripts behind the `rxova-tooling` bin (verify,
  changeset gate, release-commit scope, Node floor, pack smoke, llms.txt check, page bundle) and the
  shared tsdown, vitest, eslint, commitlint and prettier presets. Coverage thresholds live in its
  vitest preset only. This repository runs the scripts from source with `tsx`.
- `packages/toolbox` — `@rxova/toolbox`: small dependency-free runtime helpers, plus a `/react`
  entry. Neutral platform, es2020, no side effects: consumers inline it at build time.
- `packages/helpers` — `@rxova/helpers`, private: everything the published packages use but do
  not export — io adapters, parsers, constants, types and the test fixtures several suites share
  (`@rxova/helpers/fixtures`). Consumed from source, never built or published: tsdown bundles it
  into each package's dist.
- `packages/tooling/presets/*.js` — plain JavaScript on purpose: ESLint and the commit-msg hook load
  them before anything is built.
- `actions/*` — composite GitHub Actions other repositories use as
  `rxova/shared/actions/<name>@<ref>`. This repository's workflows use them through
  `./actions/<name>`, so its own CI exercises every change. Keep inputs backward compatible: a
  rename breaks every workflow pinned to `@main`.
- `apps/docs` — Astro Starlight site, deployed to GitHub Pages.

## Commands

- `pnpm run verify` — the full gate, same order as CI. Run it before saying work is done.
- `node --import tsx ./packages/tooling/src/cli.ts <command>` — the bin from source.
- `pnpm test` / `pnpm typecheck` / `pnpm lint` / `pnpm format` — the pieces.
- `pnpm --filter <package> test` — one package.
- `pnpm changeset` — record a change to a published package.

## Rules

- One function per file, and the file is named after it: `src/<function-name>.ts` exports exactly
  `functionName` (kebab-case file, camelCase export), `<function-name>.test.ts` beside it holds its
  tests, `<name>.types.ts` holds types only, `<name>.fixtures.ts` the fakes several suites share.
  `src/index.ts` re-exports only. Barrels, types and fixtures are excluded from coverage, so logic
  there is logic nobody measures.
- `@rxova/tooling` and `@rxova/toolbox` hold only their public functions: what `index.ts`, a
  subpath export or the `rxova-tooling` bin reaches. Anything else — a private helper, an io
  adapter, a constant — goes in `packages/helpers`. A published package never has a module-level
  binding it does not export.
- Coverage is 95% per file; raise thresholds, never lower them.
- Never skip, delete or weaken a test to make a change pass.
- ESLint runs `strictTypeChecked`. Fix the finding rather than disabling the rule; if a disable is
  truly needed, scope it to one line and say why.
- Conventional Commits; subject line only. Never `--no-verify`.
- No new runtime dependency in a published package without saying why. `@rxova/toolbox` takes none
  at all, and `@rxova/tooling` keeps its tools as optional peer dependencies.

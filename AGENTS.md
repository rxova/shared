# Agent guide

pnpm + Turborepo monorepo. Node >= 22.13. TypeScript everywhere, ESM only.

## Layout

- `packages/*` — published npm packages (each one needs a changeset when it changes).
- `packages/repo-config` — `@rxova/repo-config`: the repo scripts behind the `rxova-repo-config` bin (verify,
  changeset gate, release-commit scope, Node floor, pack smoke, llms.txt check) and the
  shared tsdown, vitest, eslint, commitlint and prettier presets. Coverage thresholds live in its
  vitest preset only. This repository runs the scripts from source with `tsx`.
- `packages/ts-utils` — `@rxova/ts-utils`: small dependency-free runtime helpers, plus a `/react`
  entry. Neutral platform, es2020, no side effects: consumers inline it at build time.
- `packages/claude-kit` — `@rxova/claude-kit`: the `rxova-claude-kit` bin that installs Claude Code agents, skills and
  hooks into `.claude` (Claude Code) and `.opencode` (OpenCode, through a generated plugin), in profiles. Agents and skills are Markdown under `content/`; every
  hook is a `HookSpec` in `src/hooks/hooks-table.ts`, and profiles live in
  `src/install/profiles.ts`. `content/` ships as-is; `src/hooks/hooks-entry.ts` is built as a
  standalone `dist/hooks.js` (its own tsdown config, no shared chunks) because the installer copies
  that one file out of the package.
- `packages/repo-config/presets/*.js` — plain JavaScript on purpose: ESLint and the commit-msg hook load
  them before anything is built.
- `actions/*` — composite GitHub Actions other repositories use as
  `rxova/shared/actions/<name>@<ref>`. This repository's workflows use them through
  `./actions/<name>`, so its own CI exercises every change. Keep inputs backward compatible: a
  rename breaks every workflow pinned to `@main`.
- `apps/docs` — Astro Starlight site, deployed to GitHub Pages.

## Commands

- `pnpm run verify` — the full gate, same order as CI. Run it before saying work is done.
- `node --import tsx ./packages/repo-config/src/cli.ts <command>` — the bin from source.
- `pnpm test` / `pnpm typecheck` / `pnpm lint` / `pnpm format` — the pieces.
- `pnpm --filter <package> test` — one package.
- `pnpm changeset` — record a change to a published package.

## Rules

- One function per file, and the file is named after it: `src/<topic>/<function-name>.ts` exports
  exactly `functionName` (kebab-case file, camelCase export), `<function-name>.test.ts` beside it
  holds its tests, `<name>.types.ts` holds types only, `<name>.fixtures.ts` the fakes several
  suites share. Files sit in topic folders (`scope/`, `changeset/`, `pack-smoke/`, …), never loose
  under `src/`; only `index.ts` (and ts-utils's `react.ts`) live at the root, and they re-export
  only. Barrels, types and fixtures are excluded from coverage, so logic there is logic nobody
  measures.
- No relative imports in source. A package names its own files as `@/<topic>/<file>`; each
  package's `tsconfig.json` declares `@/*` in `paths`, the vitest preset maps it for tests, tsdown
  reads it for the build, and the root `tsconfig.json` carries repo-config's for `tsx` runs from the
  repository root. The eslint preset rejects `./` and `../` imports.
- `@rxova/repo-config` and `@rxova/ts-utils` hold only their public functions: what `index.ts`, a
  subpath export or the `rxova-repo-config` bin reaches. Anything else — a private helper, an io
  adapter, a constant, a shared test fixture — goes in the package's `src/internal/<topic>/`,
  which `index.ts` never re-exports. A published package never has a module-level
  binding it does not export.
- Coverage is 95% per file; raise thresholds, never lower them.
- Never skip, delete or weaken a test to make a change pass.
- ESLint runs `strictTypeChecked`. Fix the finding rather than disabling the rule; if a disable is
  truly needed, scope it to one line and say why.
- Conventional Commits; subject line only. Never `--no-verify`.
- No new runtime dependency in a published package without saying why. `@rxova/ts-utils` takes none
  at all, and `@rxova/repo-config` keeps its tools as optional peer dependencies.

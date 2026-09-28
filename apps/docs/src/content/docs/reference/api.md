---
title: Reference
description: Every export, command and action this repository publishes.
---

## `@rxova/ts-utils`

| Export                                                | What it answers                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `isObjectLike` / `isRecord` / `isPlainObject`         | Any non-null object / not an array / an object literal or null-prototype bag |
| `tryRead` / `readProperty` / `readString`             | Property reads that never throw                                              |
| `hasProperty` / `safeKeys` / `isInstanceOf`           | `in`, `Object.keys` and `instanceof` that never throw                        |
| `objectTag` / `arrayItems`                            | The `[object Tag]` string; a copy of an array                                |
| `isError` / `errorMessage`                            | A real `Error` from any realm; the text to show for anything thrown          |
| `shallowEqual`                                        | `Object.is` per own key                                                      |
| `isDevelopment` / `createDevWarner`                   | Development detection; prefixed, coded, warn-once diagnostics                |
| `canUseDOM` / `deepFreeze` / `clamp`                  | DOM presence; recursive freeze; a bounded number                             |
| `useIsomorphicLayoutEffect` (`@rxova/ts-utils/react`) | `useLayoutEffect` in the browser, `useEffect` on the server                  |

## `@rxova/tooling`

| Command                             | What it does                                                     |
| ----------------------------------- | ---------------------------------------------------------------- |
| `rxova-tooling verify [--only a,b]` | Runs the pre-push gate, from `package.json#tooling.verify.steps` |
| `rxova-tooling check-changeset`     | Requires a changeset when a published package changed            |
| `rxova-tooling check-scope`         | Reports `code-changed=false` for a release commit                |
| `rxova-tooling node-floor`          | Reads the one `engines.node` floor the packages share            |
| `rxova-tooling pack-smoke [dir]`    | Packs, installs, imports and requires a package from its tarball |
| `rxova-tooling check-llms [root]`   | Holds each `llms.txt` to the package exports                     |

Presets: `@rxova/tooling/tsdown`, `/vitest`, `/eslint`, `/commitlint`, `/prettier`,
`/tsconfig.base.json`.

## `@rxova/ai`

| Command                                                                                   | What it does                                                        |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `rxova-ai list [--profile p]`                                                             | Lists every agent, skill and hook, and the profiles that include it |
| `rxova-ai install [--profile p] [--add a,b] [--skip c] [--project] [--dry-run] [--force]` | Installs a profile (`core`, `hackathon`, `full`) into `.claude`     |
| `rxova-ai uninstall [--project] [--dry-run]`                                              | Removes exactly what the last install wrote                         |
| `rxova-ai status [--project]`                                                             | Shows the installed profile and any missing or changed file         |

Hooks run on their own; Claude loads skills and hands work to agents when a request matches
their description, or when you name one (`/rx-kickoff`, "use rx-architect"). See the
[package README](https://github.com/rxova/shared/tree/main/packages/ai#how-it-works) for how it
works and an example.

### Hooks

| Hook               | What it does                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `no-bypass`        | Blocks git calls that skip the repository's hooks (`--no-verify`, `HUSKY=0`, …)                          |
| `no-attribution`   | Blocks commit messages and PR bodies that credit an AI assistant                                         |
| `danger-zone`      | Blocks `rm -r` outside the project, force pushes to main, discarding work, dropping data, cloud teardown |
| `dev-server`       | Blocks dev servers and watchers started in the foreground                                                |
| `config-lock`      | Blocks edits to existing lint, format, type, commit and coverage configs                                 |
| `secret-guard`     | Blocks writing API keys, tokens and private keys into source files                                       |
| `quick-check`      | Formats and lints each edited file with the project's tools, and reports problems back                   |
| `memory-snapshot`  | Saves a snapshot note before compaction and at session end                                               |
| `handoff-reminder` | Points a new session at the latest handoff note or snapshot                                              |
| `context-nudge`    | Asks for a handoff note and a compact at 60% and 80% of the context window                               |

### Skills

Workflow:

| Skill               | Use it to                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| `rx-kickoff`        | Turn an idea into a scoped plan, a repo with agent instructions, and a live deploy in hour one. |
| `rx-timebox`        | Run the build against the clock: checkpoints, cut lists, a feature freeze, the last two hours.  |
| `rx-slice`          | Break a feature into thin end-to-end slices and ship them one at a time.                        |
| `rx-parallel`       | Run several sessions and agents at once with worktrees, without collisions.                     |
| `rx-tdd`            | Test first where it pays, and skip it where it does not.                                        |
| `rx-debug`          | Reproduce, isolate and fix a bug at its root, with a regression test.                           |
| `rx-verify`         | Run the repository's own gate before calling work done.                                         |
| `rx-ship`           | Get a change merged the repository's way: branch, commits, checks, pull request.                |
| `rx-handoff`        | Write a note a fresh session can resume from, or resume from one.                               |
| `rx-e2e`            | Put a Playwright smoke suite on the demo path.                                                  |
| `rx-security-sweep` | Do a 30-minute security pass before the demo.                                                   |
| `rx-demo`           | Make the demo impossible to fail: seed data, a script, fallbacks, a backup video.               |
| `rx-theme-audit`    | Measure a site's dark and light themes in a browser and trace each problem to its source.       |

Stacks:

| Skill           | Use it to                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| `rx-react-web`  | Build with Next.js or Vite: rendering, data fetching, forms, env vars.                        |
| `rx-ui-kit`     | Get a good-looking, accessible UI fast with Tailwind and shadcn/ui, dark mode included.       |
| `rx-node-api`   | Build a typed API with Hono (or Fastify/Express): validation, errors, auth, CORS, tests.      |
| `rx-python-api` | Build an API with FastAPI and uv: models, dependencies, async database, tests, Docker.        |
| `rx-expo`       | Ship a React Native app with Expo: routing, devices, env vars, auth, EAS.                     |
| `rx-claude-api` | Add AI features with the Claude API: streaming, tools, structured output, caching, cost caps. |
| `rx-auth`       | Pick and wire authentication fast, with a seeded demo account.                                |

Platforms:

| Skill                  | Use it to                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `rx-supabase`          | Use Supabase: local dev, migrations, row-level security, storage, edge functions, types. |
| `rx-postgres`          | Use Postgres with Drizzle or Prisma: schema, migrations, pooling, indexes, seeds.        |
| `rx-deploy-vercel`     | Deploy to Vercel or Netlify: previews, env vars, monorepos, limits, rollback.            |
| `rx-deploy-cloudflare` | Deploy Workers and Pages with wrangler: bindings, secrets, D1, R2, KV.                   |
| `rx-deploy-container`  | Deploy containers to Fly.io, Railway or anywhere Docker runs.                            |
| `rx-aws`               | Take the fast paths on AWS, with a budget alarm first and a teardown list last.          |

### Agents

| Agent            | Model  | Can edit | Use it to                                                               |
| ---------------- | ------ | -------- | ----------------------------------------------------------------------- |
| `rx-planner`     | opus   | no       | Turn a request into a sliced plan grounded in the code.                 |
| `rx-architect`   | opus   | no       | Design the system for a time-boxed build: parts, data, boundaries.      |
| `rx-security`    | opus   | no       | Find what would embarrass the demo: secrets, auth gaps, RLS, injection. |
| `rx-reviewer`    | sonnet | no       | Review a diff and report only defects it can back.                      |
| `rx-researcher`  | sonnet | no       | Answer "how do I do X with Y" from official docs, with sources.         |
| `rx-builder`     | sonnet | yes      | Build one slice end to end, with tests.                                 |
| `rx-debugger`    | sonnet | yes      | Find a bug's root cause and fix it with a regression test.              |
| `rx-test-writer` | sonnet | yes      | Add tests that check behaviour.                                         |
| `rx-build-fixer` | sonnet | yes      | Turn a red build green with the smallest honest diff.                   |
| `rx-ui`          | sonnet | yes      | Build and polish UI: responsive, accessible, every state.               |
| `rx-db`          | sonnet | yes      | Design schemas, migrations, policies and demo seed data.                |
| `rx-deployer`    | sonnet | yes      | Ship to the chosen platform and prove the live URL works.               |
| `rx-pitch`       | sonnet | yes      | Write the demo script and the pitch.                                    |
| `rx-scout`       | haiku  | no       | Find where things live without flooding the context.                    |
| `rx-doc-writer`  | haiku  | yes      | Write a README a judge can follow in five minutes.                      |

## GitHub Actions

| Action                                    | Inputs                         | What it does                                                                    |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `rxova/shared/actions/setup-pnpm`         | `node-version`, `registry-url` | pnpm from `packageManager` (install cached) and Node with the pnpm store cached |
| `rxova/shared/actions/turbo-cache`        | `key`                          | Restores and saves `.turbo` per job; pass `key` per matrix leg                  |
| `rxova/shared/actions/turbo-remote-cache` | —                              | A Turbo remote cache backed by the Actions cache, per task hash                 |
| `rxova/shared/actions/setup-playwright`   | `browsers`                     | Installs Playwright browsers, cached by Playwright version                      |

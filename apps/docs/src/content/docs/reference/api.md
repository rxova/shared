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

## `@rxova/repo-config`

| Command                                 | What it does                                                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `rxova-repo-config verify [--only a,b]` | Runs the pre-push gate, from `package.json#repoConfig.verify.steps`                                 |
| `rxova-repo-config check-changeset`     | Requires a changeset when a published package changed                                               |
| `rxova-repo-config check-scope`         | Reports `code-changed=false` for a release commit                                                   |
| `rxova-repo-config node-floor`          | Reads the one `engines.node` floor the packages share                                               |
| `rxova-repo-config pack-smoke [dir]`    | Packs, installs, imports and requires a package from its tarball, and checks what the tarball ships |
| `rxova-repo-config check-llms [root]`   | Holds each `llms.txt` to the package exports                                                        |

`pack-smoke` also fails when a `files` entry (nested paths and globs included), the README, the
license or any `exports`, `main`, `types` or bin target is missing from the tarball; when it ships
`src/`, `e2e/`, `__tests__` or `*.test.*` / `*.spec.*` files that no `files` entry names; and when a
built entry lost the `'use client'` directive its source opens with. `workspace:` dependencies,
optional dependencies and peers resolve the way `pnpm publish` writes them.

Presets: `@rxova/repo-config/tsdown`, `/vitest`, `/eslint`, `/commitlint`, `/prettier`,
`/tsconfig.base.json`. `baseVitestConfig` holds every file to 95% coverage; a package can override
single axes with `thresholds` (`{ branches: 88 }`), and change what is measured or discovered with
`coverageInclude`, `exclude` and `testExclude`.

## `@rxova/agent-kit`

| Command                                                                                                       | What it does                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rxova-agent-kit list [--profile p]`                                                                          | Lists every agent, skill and hook, and the profiles that include it                                                                                          |
| `rxova-agent-kit install [--target t] [--profile p] [--add a,b] [--skip c] [--project] [--dry-run] [--force]` | Installs a profile (`core`, `hackathon`, `dotnet`, `react`, `qa`, `marketing`, `full`) for Claude Code, OpenCode or both (`--target claude\|opencode\|both`) |
| `rxova-agent-kit uninstall [--target t] [--project] [--dry-run]`                                              | Removes exactly what each install wrote                                                                                                                      |
| `rxova-agent-kit status [--target t] [--project]`                                                             | Shows each installed target's profile and any missing or changed file                                                                                        |

Hooks run on their own; Claude (or OpenCode) loads skills and hands work to agents when a
request matches their description, or when you name one (`/rx-kickoff`, "use rx-architect"). In
OpenCode the hooks run through a plugin the install writes. See the
[package README](https://github.com/rxova/shared/tree/main/packages/agent-kit#how-it-works) for
how it works, two worked examples, and what differs in OpenCode.

### Hooks

| Hook               | What it does                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `no-bypass`        | Blocks git calls that skip the repository's hooks (`--no-verify`, `HUSKY=0`, …)                                             |
| `no-attribution`   | Blocks commit messages and PR bodies that credit an AI assistant                                                            |
| `danger-zone`      | Blocks `rm -r` outside the project, force pushes to main, discarding work, dropping data (SQL, `dotnet ef`), cloud teardown |
| `dev-server`       | Blocks dev servers and watchers started in the foreground                                                                   |
| `config-lock`      | Blocks edits to existing lint, format, type, commit and coverage configs                                                    |
| `secret-guard`     | Blocks writing API keys, tokens and private keys into source files                                                          |
| `quick-check`      | Formats and lints each edited file with the project's tools, and reports problems back                                      |
| `memory-snapshot`  | Saves a snapshot note before compaction and at session end                                                                  |
| `handoff-reminder` | Points a new session at the latest handoff note or snapshot                                                                 |
| `context-nudge`    | Asks for a handoff note and a compact at 60% and 80% of the context window                                                  |

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

React:

| Skill                  | Use it to                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `rx-fe-redux-toolkit`  | Use Redux Toolkit 2: store, slices, typed hooks, RTK Query tags and optimistic updates, migration.   |
| `rx-fe-code-splitting` | Split by route and feature, preload on intent, recover from stale chunks, hold a bundle budget.      |
| `rx-fe-hooks`          | Write custom hooks, drop effects you don't need, get deps and cleanup right, use React 19 hooks.     |
| `rx-fe-performance`    | Profile first, cut re-renders, lean on the React Compiler, virtualise lists, fix LCP, INP and CLS.   |
| `rx-fe-state`          | Decide where state lives: local, URL, server cache, store, context or form. Derive, don't duplicate. |
| `rx-fe-testing`        | Test components with Testing Library role queries, user-event and MSW; split component from e2e.     |

QA:

| Skill               | Use it to                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `rx-qa-test-plan`   | Plan a feature or release by risk: ranked risks, a test matrix, automated vs manual, exit criteria.  |
| `rx-qa-exploratory` | Run time-boxed exploratory sessions with charters, heuristics and tours; turn findings into tests.   |
| `rx-qa-bug-report`  | Write bugs anyone can reproduce: minimal steps, evidence, severity vs priority, then a failing test. |
| `rx-qa-regression`  | Scope smoke and regression runs from the diff and the risks, with a release checklist and sign-off.  |
| `rx-qa-flaky`       | Reproduce a flaky test with repeats and shuffles, fix the root cause, quarantine with an owner.      |
| `rx-qa-a11y`        | Test accessibility: axe, keyboard, screen reader, 400% reflow, forms, mapped to WCAG 2.2 AA.         |

Marketing:

| Skill                | Use it to                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| `rx-mkt-positioning` | Pin down who it's for, the alternative, what's unique, the category and the one-liner.                 |
| `rx-mkt-landing`     | Write landing page and store listing copy, meta and OG text, in the site's own file, and measure it.   |
| `rx-mkt-launch`      | Plan a launch: channels and their rules, assets, a day-of timeline, funnel events, a retro.            |
| `rx-mkt-ceo`         | Think like the CEO: north-star and input metrics, weekly priorities, decision memos, pricing, updates. |
| `rx-mkt-voice`       | Set the app's voice and tone, fix microcopy and errors, keep a glossary and i18n-safe strings.         |

.NET:

| Skill               | Use it to                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `rx-dotnet-upgrade` | Move a service from .NET 6 or 8 to .NET 10: inventory, baseline, SDK and packages, breaking changes, images, CI. |
| `rx-dotnet-api`     | Build and upgrade ASP.NET Core APIs: minimal APIs or controllers, validation, ProblemDetails, auth, OpenAPI.     |
| `rx-efcore`         | Upgrade and use EF Core safely: breaking changes, migrations and production scripts, providers, performance.     |
| `rx-dotnet-workers` | Run hosted services and messaging reliably: shutdown, scopes, retries, idempotency, outbox, brokers.             |
| `rx-dotnet-testing` | Test with Shouldly: detect the framework, convert FluentAssertions, WebApplicationFactory, Testcontainers.       |

Datadog:

| Skill                    | Use it to                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `rx-datadog-dotnet`      | Instrument a .NET service with the tracer, service tags, log correlation and metrics, and keep it working through an upgrade.       |
| `rx-datadog-investigate` | Go from an alert or symptom to the failing span and its logs, before and after a deploy, through the Datadog MCP server or the API. |
| `rx-datadog-monitors`    | Manage monitors, SLOs and dashboards as code, and keep them valid after renames.                                                    |

### Agents

| Agent                | Model  | Can edit | Use it to                                                                                                                                                   |
| -------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rx-planner`         | fable  | no       | Turn a request into a sliced plan grounded in the code.                                                                                                     |
| `rx-architect`       | fable  | no       | Design the system for a time-boxed build: parts, data, boundaries.                                                                                          |
| `rx-security`        | fable  | no       | Find what would embarrass the demo: secrets, auth gaps, RLS, injection.                                                                                     |
| `rx-reviewer`        | opus   | no       | Review a diff and report only defects it can back.                                                                                                          |
| `rx-researcher`      | opus   | no       | Answer "how do I do X with Y" from official docs, with sources.                                                                                             |
| `rx-builder`         | opus   | yes      | Build one slice end to end, with tests.                                                                                                                     |
| `rx-debugger`        | opus   | yes      | Find a bug's root cause and fix it with a regression test.                                                                                                  |
| `rx-test-writer`     | opus   | yes      | Add tests that check behaviour.                                                                                                                             |
| `rx-build-fixer`     | opus   | yes      | Turn a red build green with the smallest honest diff.                                                                                                       |
| `rx-ui`              | opus   | yes      | Build and polish UI: responsive, accessible, every state.                                                                                                   |
| `rx-db`              | opus   | yes      | Design schemas, migrations, policies and demo seed data.                                                                                                    |
| `rx-deployer`        | opus   | yes      | Ship to the chosen platform and prove the live URL works.                                                                                                   |
| `rx-pitch`           | opus   | yes      | Write the demo script and the pitch.                                                                                                                        |
| `rx-scout`           | sonnet | no       | Find where things live without flooding the context.                                                                                                        |
| `rx-doc-writer`      | sonnet | yes      | Write a README a judge can follow in five minutes.                                                                                                          |
| `rx-dotnet-migrator` | opus   | yes      | Upgrade one .NET service to .NET 10: baseline, change, build, fix, test, smoke, with a log.                                                                 |
| `rx-dotnet-reviewer` | opus   | no       | Review a .NET diff: async, DI lifetimes, EF Core safety, behaviour the upgrade changed.                                                                     |
| `rx-observability`   | opus   | no       | Investigate production behaviour in Datadog and report with evidence; changes nothing unless asked. Has no tool list, so it can use the Datadog MCP server. |
| `rx-fe-builder`      | opus   | yes      | Build React features in the repo's own conventions, and verify them.                                                                                        |
| `rx-fe-reviewer`     | opus   | no       | Review React: hooks, effects, re-renders, state, a11y, bundle size.                                                                                         |
| `rx-qa-tester`       | opus   | yes      | Explore the running app against a charter; report bugs with evidence.                                                                                       |
| `rx-qa-flake-hunter` | opus   | yes      | Fix a flaky test at its root and prove it with repeat runs.                                                                                                 |
| `rx-mkt-advisor`     | fable  | yes      | A CEO's second opinion: test plans against the goal, cut, write memos.                                                                                      |
| `rx-mkt-marketer`    | opus   | yes      | Write positioning, landing and launch copy from what the code does.                                                                                         |
| `rx-mkt-copywriter`  | opus   | yes      | Rewrite in-app copy to the voice guide; strings only, never logic.                                                                                          |

## GitHub Actions

| Action                                    | Inputs                         | What it does                                                                    |
| ----------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- |
| `rxova/shared/actions/setup-pnpm`         | `node-version`, `registry-url` | pnpm from `packageManager` (install cached) and Node with the pnpm store cached |
| `rxova/shared/actions/turbo-cache`        | `key`                          | Restores and saves `.turbo` per job; pass `key` per matrix leg                  |
| `rxova/shared/actions/turbo-remote-cache` | —                              | A Turbo remote cache backed by the Actions cache, per task hash                 |
| `rxova/shared/actions/setup-playwright`   | `browsers`                     | Installs Playwright browsers, cached by Playwright version                      |

<p align="center">
  <img src="./assets/logo.svg" width="160" alt="@rxova/agent-kit logo" />
</p>

<h1 align="center">@rxova/agent-kit</h1>

<p align="center">Guard rails, skills and agents for Claude Code and OpenCode, in one install.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@rxova/agent-kit"><img src="https://img.shields.io/npm/v/@rxova/agent-kit?color=cb3837&logo=npm&logoColor=white" alt="npm version" /></a>
  <a href="https://github.com/rxova/shared/actions/workflows/ci.yml"><img src="https://github.com/rxova/shared/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI status" /></a>
  <img src="https://img.shields.io/badge/Node.js-%E2%89%A522.13-5fa04e?logo=nodedotjs&logoColor=white" alt="Node.js 22.13 or newer" />
  <img src="https://img.shields.io/badge/Claude%20Code-%E2%9C%93-6b3df0" alt="Works with Claude Code" />
  <img src="https://img.shields.io/badge/OpenCode-%E2%9C%93-3b3b3b" alt="Works with OpenCode" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license" /></a>
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#profiles">Profiles</a> ·
  <a href="#hooks">Hooks</a> ·
  <a href="#skills">Skills</a> ·
  <a href="#agents">Agents</a> ·
  <a href="#commands">Commands</a>
</p>

Build fast without breaking things: a new product on a deadline, a React front end, a release
that has to hold, a launch, or a fleet of backend services moved to .NET 10. The kit stops the agent before the costly mistakes, and gives it the playbooks
and the specialists for everything else.

```console
$ npx @rxova/agent-kit install --profile hackathon
Installed rx-ai (hackathon: 15 agents, 24 skills, 10 hooks) for Claude Code into ~/.claude.
```

Then, in any session, when the agent reaches for a shortcut:

```console
● Bash(git commit --no-verify -m "wip")
  ⎿  rx-ai no-bypass: git commit is set to skip its hooks. Run it without the bypass;
     if a hook fails, fix what it reports.

● Bash(pnpm dev)
  ⎿  rx-ai dev-server: This starts a process that never exits. Run it with
     run_in_background: true and read its output from there.
```

## What you get

|                        |                                                                                                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🛡️ **6 guards**        | Block the mistakes that cost an afternoon: skipping git hooks, AI attribution in commits, destroying data or work, leaking keys, hanging on a dev server, loosening lint rules. |
| 🔧 **4 helpers**       | Format and lint every edit, save a snapshot before compaction, point a new session at the last handoff, and warn before the context fills up.                                   |
| 📚 **51 skills**       | Playbooks Claude loads when a request matches: workflow from kickoff to demo, stacks, platforms, React, QA, marketing, the .NET 10 upgrade, Datadog.                            |
| 🤖 **25 agents**       | Specialists Claude hands work to, each with the fewest tools its job needs and a model sized to it.                                                                             |
| 📦 **Profiles**        | Install a set, not everything: every installed description is loaded into every session.                                                                                        |
| ↩️ **Clean uninstall** | A manifest records every file and hook the install wrote. Uninstall removes exactly those; nothing you wrote is touched.                                                        |

## Install

```sh
npx @rxova/agent-kit install                                 # core: the guards and the everyday set
npx @rxova/agent-kit install --profile hackathon             # everything for building a product fast
npx @rxova/agent-kit install --profile react                 # React: Redux Toolkit, hooks, code splitting, performance
npx @rxova/agent-kit install --profile qa                    # test plans, exploratory runs, bug reports, flaky tests
npx @rxova/agent-kit install --profile marketing             # positioning, landing copy, launch, CEO view, in-app voice
npx @rxova/agent-kit install --profile dotnet --target both  # .NET and Datadog, for Claude Code and OpenCode
npx @rxova/agent-kit install --profile full                  # all of it
npx @rxova/agent-kit list                                    # every item, and which profiles include it
```

Restart Claude Code afterwards so it loads the new agents, skills and hooks. Run `install` again
to update or widen: with no `--profile` it keeps the last selection, so `--add rx-kickoff` alone
adds one item.

## Profiles

With no `--profile`, you get **`core`**: the guards, and the agents and skills used on every change.
The headline numbers above are `full`.

| Profile         | Agents | Skills | Hooks | For                                                                                     |
| --------------- | :----: | :----: | :---: | --------------------------------------------------------------------------------------- |
| **`core`**      |   6    |   5    |   6   | Every repository. The guards, plan → build → review → ship.                             |
| **`hackathon`** |   15   |   24   |  10   | A product on a deadline. Everything but `rx-tdd`, `rx-theme-audit` and the sets below.  |
| **`react`**     |   10   |   15   |  10   | React front ends. `core`, plus every `rx-fe-*` item and the UI and test helpers.        |
| **`qa`**        |   10   |   15   |  10   | Quality assurance. `core`, plus every `rx-qa-*` item and the test and security helpers. |
| **`marketing`** |   12   |   12   |  10   | Running the product. `core`, plus every `rx-mkt-*` item, the pitch, demo and docs.      |
| **`dotnet`**    |   13   |   18   |  10   | Service migrations. `core`, plus .NET, EF Core, Datadog and helpers.                    |
| **`full`**      |   25   |   51   |  10   | Everything.                                                                             |

<details>
<summary><b>Exactly what each profile holds</b></summary>

<br />

- **`core`**: the 6 guards; `rx-planner`, `rx-reviewer`, `rx-scout`, `rx-builder`, `rx-debugger`,
  `rx-build-fixer`; `rx-verify`, `rx-handoff`, `rx-slice`, `rx-debug`, `rx-ship`.
- **`dotnet`**: `core`, plus every .NET, EF Core and Datadog skill and agent, plus
  `rx-architect`, `rx-test-writer`, `rx-security`, `rx-researcher`, `rx-parallel`, `rx-tdd`,
  `rx-security-sweep`, `rx-postgres`, `rx-deploy-container` and the 4 helper hooks.
- **`react`**: `core`, plus every `rx-fe-*` skill and agent, plus `rx-ui`, `rx-test-writer`,
  `rx-react-web`, `rx-ui-kit`, `rx-e2e`, `rx-tdd` and the 4 helper hooks.
- **`qa`**: `core`, plus every `rx-qa-*` skill and agent, plus `rx-test-writer`, `rx-security`,
  `rx-e2e`, `rx-tdd`, `rx-theme-audit`, `rx-security-sweep` and the 4 helper hooks.
- **`marketing`**: `core`, plus every `rx-mkt-*` skill and agent, plus `rx-pitch`,
  `rx-doc-writer`, `rx-researcher`, `rx-demo`, `rx-kickoff` and the 4 helper hooks.

`rxova-agent-kit list --profile <name>` prints any profile item by item.

</details>

## How it works

You install once, then talk to Claude as usual. The kit works at three levels:

| Part          | Who starts it                         | How                                                                                                   |
| ------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 🪝 **Hooks**  | Claude Code, on its own               | Fire on events: before a command or edit, after an edit, at session start and end, before compaction. |
| 📚 **Skills** | Claude when a request matches, or you | Claude loads a skill whose description fits. Type `/rx-kickoff`, `/rx-demo`, … to load one yourself.  |
| 🤖 **Agents** | Claude when a task matches, or you    | Claude delegates to an agent and gets a summary back. Say "have rx-reviewer check this" to pick one.  |

A guard only watches Claude's own tool calls. When it blocks something you really want, run it
yourself in a terminal, or switch that guard off for the session (see [Settings](#settings)).

<details>
<summary><b>Walkthrough: a new product on a deadline</b></summary>

<br />

1. **"We're building a split-the-bill app for group trips, 24 hours. Let's kick off."**
   Claude follows `rx-kickoff`: the demo moment, one golden path, a boring stack, a `CLAUDE.md`,
   a deploy in the first hour. `rx-architect` designs the data model; `rx-slice` cuts the work
   into slices and stops for your go-ahead.
2. **"Go, slice 1."** `rx-builder` builds it. After every edit `quick-check` lints the file.
   `pnpm dev` in the foreground is stopped by `dev-server`; a Supabase key in a source file by
   `secret-guard`; a `--no-verify` commit by `no-bypass`. `rx-ship` opens the pull request.
3. **Hour 14.** `context-nudge` says the context is 60% full; Claude writes a handoff note
   (`rx-handoff`). `memory-snapshot` saves state before the compact, and next session
   `handoff-reminder` points Claude at it.
4. **"Login works locally but not on Vercel."** `rx-debug` and `rx-deploy-vercel`. A panicked
   `git reset --hard` on uncommitted work is stopped by `danger-zone`.
5. **"Get us demo-ready."** `rx-security-sweep` and `rx-security` check for leaks and missing
   row-level security, `rx-demo` adds seed data and a click-by-click script, `rx-pitch` writes
   the pitch.

</details>

<details>
<summary><b>Walkthrough: moving a service to .NET 10</b></summary>

<br />

1. **"Upgrade the orders service from .NET 6 to .NET 10."** `rx-dotnet-upgrade`: an inventory of
   projects, packages, images and CI; a green baseline; then the SDK, target framework and
   packages. `rx-dotnet-migrator` works through breaking changes one area at a time, with a log.
2. **Tests.** `rx-dotnet-testing` detects the framework and mocking library, converts
   FluentAssertions to Shouldly, and adds WebApplicationFactory and Testcontainers tests where
   behaviour changed. `dotnet run` in the foreground is stopped by `dev-server`,
   `dotnet ef database drop` by `danger-zone`.
3. **Observability.** `rx-datadog-dotnet` checks the tracer supports .NET 10 and the service tags
   still line up; after the deploy, `rx-observability` compares error rate and latency before and
   after through the Datadog MCP server, and `rx-datadog-monitors` fixes monitors on renamed
   resources.
4. **Review and ship.** `rx-dotnet-reviewer` checks async and DI mistakes, EF Core query and
   migration safety, and behaviour the framework change altered; `rx-ship` opens the pull request.

</details>

## Hooks

Every hook runs through one bundled file, `rx-ai/hooks.js`, that imports only Node: no `npx` per
call, about 80 ms each. A guard that blocks exits 2 and tells the agent why and what to do
instead. On anything unexpected a hook lets the call through: it never breaks a session because
of its own failure.

**🛡️ Guards** — in every profile

| Hook             | Blocks                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-bypass`      | Git calls that skip the repository's hooks: `--no-verify`, `commit -n`, `HUSKY=0`, changing `core.hooksPath`.                                                             |
| `no-attribution` | Commit messages and `gh pr` bodies that credit an AI assistant: `Co-Authored-By: Claude`, session trailers, "Generated with Claude", 🤖. Message and body files included. |
| `danger-zone`    | `rm -r` outside the project, force pushes to `main`, `reset --hard` on a dirty tree, SQL `DROP`/`TRUNCATE`, database resets, `terraform destroy` and other teardown.      |
| `dev-server`     | Dev servers and watchers in the foreground (`pnpm dev`, `vite`, `uvicorn`, `dotnet watch`, `docker compose up`, …); says to use `run_in_background`.                      |
| `config-lock`    | Edits to an existing lint, format, type, commit or coverage config. Creating one is fine; `Directory.Build.props` and `Directory.Packages.props` stay editable.           |
| `secret-guard`   | API keys, tokens and private keys written into source files (AWS, Anthropic, OpenAI, Stripe, GitHub, Slack, Google, Datadog, Azure, Supabase). `.env` files pass.         |

**🔧 Helpers** — in `hackathon`, `dotnet` and `full`

| Hook               | When                           | Does                                                                                                                                 |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `quick-check`      | after Edit/Write               | Formats and lints the edited file with the project's own tools (Biome, Prettier + ESLint, Ruff, `dotnet format`) and reports back.   |
| `memory-snapshot`  | before compaction, session end | Saves branch, uncommitted files, recent commits and the last requests to `.claude/handoff/auto/`, git-ignored, keeping the last ten. |
| `handoff-reminder` | session start                  | Points the agent at the newest handoff note (a week at most) or snapshot (two days).                                                 |
| `context-nudge`    | after any tool                 | At 60% and 80% of the context window, tells the agent to reach a break, write a handoff and suggest `/compact`.                      |

### Settings

| Variable               | Example                 | Effect                                                                    |
| ---------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `RX_AI_OFF`            | `RX_AI_OFF=config-lock` | Switches hooks off, e.g. for one session: `RX_AI_OFF=config-lock claude`. |
| `RX_AI_CONTEXT_WINDOW` | `1000000`               | The window size `context-nudge` measures against (200,000 by default).    |

### Status line

`--statusline` also sets Claude Code's status line to the kit's script, so a new machine gets the
same bar from the same install:

```sh
npx @rxova/agent-kit install --statusline      # add it (kept on later installs)
npx @rxova/agent-kit install --no-statusline   # take it out again
```

Two lines: the model, a context bar, the project (and worktree) and git branch with staged,
modified, untracked and ahead/behind counts; then session cost and time, lines changed, 5-hour
and weekly plan usage, and the output style and Claude Code version. It needs `bash`, `jq` and
`git`, and a Powerline or Nerd Font for the separators. A status line someone else set is left
alone unless you add `--force`; uninstall removes only the kit's.

## Skills

Each skill is a folder with a `SKILL.md`: when to use it, the steps, and an example.

| Group            | Skills                                                                                                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🧭 **Workflow**  | `rx-kickoff` · `rx-timebox` · `rx-slice` · `rx-parallel` · `rx-tdd` · `rx-debug` · `rx-verify` · `rx-ship` · `rx-handoff` · `rx-e2e` · `rx-security-sweep` · `rx-demo` · `rx-theme-audit` |
| 🧱 **Stacks**    | `rx-react-web` · `rx-ui-kit` · `rx-node-api` · `rx-python-api` · `rx-expo` · `rx-claude-api` · `rx-auth`                                                                                  |
| ☁️ **Platforms** | `rx-supabase` · `rx-postgres` · `rx-deploy-vercel` · `rx-deploy-cloudflare` · `rx-deploy-container` · `rx-aws`                                                                            |
| ⚛️ **React**     | `rx-fe-redux-toolkit` · `rx-fe-code-splitting` · `rx-fe-hooks` · `rx-fe-performance` · `rx-fe-state` · `rx-fe-testing`                                                                    |
| 🧪 **QA**        | `rx-qa-test-plan` · `rx-qa-exploratory` · `rx-qa-bug-report` · `rx-qa-regression` · `rx-qa-flaky` · `rx-qa-a11y`                                                                          |
| 📣 **Marketing** | `rx-mkt-positioning` · `rx-mkt-landing` · `rx-mkt-launch` · `rx-mkt-ceo` · `rx-mkt-voice`                                                                                                 |
| 🟣 **.NET**      | `rx-dotnet-upgrade` · `rx-dotnet-api` · `rx-efcore` · `rx-dotnet-workers` · `rx-dotnet-testing`                                                                                           |
| 🐶 **Datadog**   | `rx-datadog-dotnet` · `rx-datadog-investigate` · `rx-datadog-monitors`                                                                                                                    |

<details>
<summary><b>What each skill is for</b></summary>

<br />

| Skill                    | Use it to                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `rx-kickoff`             | Turn an idea into a scoped plan, a repo with agent instructions, and a live deploy in hour one.        |
| `rx-timebox`             | Run the build against the clock: checkpoints, cut lists, a feature freeze, the last two hours.         |
| `rx-slice`               | Break a feature into thin end-to-end slices and ship them one at a time.                               |
| `rx-parallel`            | Run several sessions and agents at once with worktrees, without collisions.                            |
| `rx-tdd`                 | Test first where it pays, and skip it where it does not.                                               |
| `rx-debug`               | Reproduce, isolate and fix a bug at its root, with a regression test.                                  |
| `rx-verify`              | Run the repository's own gate before calling work done.                                                |
| `rx-ship`                | Get a change merged the repository's way: branch, commits, checks, pull request.                       |
| `rx-handoff`             | Write a note a fresh session can resume from, or resume from one.                                      |
| `rx-e2e`                 | Put a Playwright smoke suite on the demo path.                                                         |
| `rx-security-sweep`      | Do a 30-minute security pass before the demo.                                                          |
| `rx-demo`                | Make the demo impossible to fail: seed data, a script, fallbacks, a backup video.                      |
| `rx-theme-audit`         | Measure a site's dark and light themes in a browser and trace each problem to its source.              |
| `rx-react-web`           | Build with Next.js or Vite: rendering, data fetching, forms, env vars.                                 |
| `rx-ui-kit`              | Get a good-looking, accessible UI fast with Tailwind and shadcn/ui, dark mode included.                |
| `rx-node-api`            | Build a typed API with Hono (or Fastify/Express): validation, errors, auth, CORS, tests.               |
| `rx-python-api`          | Build an API with FastAPI and uv: models, dependencies, async database, tests, Docker.                 |
| `rx-expo`                | Ship a React Native app with Expo: routing, devices, env vars, auth, EAS.                              |
| `rx-claude-api`          | Add AI features with the Claude API: streaming, tools, structured output, caching, cost caps.          |
| `rx-auth`                | Pick and wire authentication fast, with a seeded demo account.                                         |
| `rx-supabase`            | Use Supabase: local dev, migrations, row-level security, storage, edge functions, types.               |
| `rx-postgres`            | Use Postgres with Drizzle or Prisma: schema, migrations, pooling, indexes, seeds.                      |
| `rx-deploy-vercel`       | Deploy to Vercel or Netlify: previews, env vars, monorepos, limits, rollback.                          |
| `rx-deploy-cloudflare`   | Deploy Workers and Pages with wrangler: bindings, secrets, D1, R2, KV.                                 |
| `rx-deploy-container`    | Deploy containers to Fly.io, Railway or anywhere Docker runs.                                          |
| `rx-aws`                 | Take the fast paths on AWS, with a budget alarm first and a teardown list last.                        |
| `rx-fe-redux-toolkit`    | Use Redux Toolkit 2: store, slices, typed hooks, RTK Query tags and optimistic updates, migration.     |
| `rx-fe-code-splitting`   | Split by route and feature, preload on intent, recover from stale chunks, hold a bundle budget.        |
| `rx-fe-hooks`            | Write custom hooks, drop effects you don't need, get deps and cleanup right, use React 19 hooks.       |
| `rx-fe-performance`      | Profile first, cut re-renders, lean on the React Compiler, virtualise lists, fix LCP, INP and CLS.     |
| `rx-fe-state`            | Decide where state lives: local, URL, server cache, store, context or form. Derive, don't duplicate.   |
| `rx-fe-testing`          | Test components with Testing Library role queries, user-event and MSW; split component from e2e.       |
| `rx-qa-test-plan`        | Plan a feature or release by risk: ranked risks, a test matrix, automated vs manual, exit criteria.    |
| `rx-qa-exploratory`      | Run time-boxed exploratory sessions with charters, heuristics and tours; turn findings into tests.     |
| `rx-qa-bug-report`       | Write bugs anyone can reproduce: minimal steps, evidence, severity vs priority, then a failing test.   |
| `rx-qa-regression`       | Scope smoke and regression runs from the diff and the risks, with a release checklist and sign-off.    |
| `rx-qa-flaky`            | Reproduce a flaky test with repeats and shuffles, fix the root cause, quarantine with an owner.        |
| `rx-qa-a11y`             | Test accessibility: axe, keyboard, screen reader, 400% reflow, forms, mapped to WCAG 2.2 AA.           |
| `rx-mkt-positioning`     | Pin down who it's for, the alternative, what's unique, the category and the one-liner.                 |
| `rx-mkt-landing`         | Write landing page and store listing copy, meta and OG text, in the site's own file, and measure it.   |
| `rx-mkt-launch`          | Plan a launch: channels and their rules, assets, a day-of timeline, funnel events, a retro.            |
| `rx-mkt-ceo`             | Think like the CEO: north-star and input metrics, weekly priorities, decision memos, pricing, updates. |
| `rx-mkt-voice`           | Set the app's voice and tone, fix microcopy and errors, keep a glossary and i18n-safe strings.         |
| `rx-dotnet-upgrade`      | Move a service from .NET 6 or 8 to .NET 10: inventory, baseline, packages, breaking changes, CI.       |
| `rx-dotnet-api`          | Build and upgrade ASP.NET Core APIs: minimal APIs or controllers, validation, ProblemDetails, OpenAPI. |
| `rx-efcore`              | Upgrade and use EF Core safely: breaking changes, migrations and production scripts, performance.      |
| `rx-dotnet-workers`      | Run hosted services and messaging reliably: shutdown, scopes, retries, idempotency, outbox.            |
| `rx-dotnet-testing`      | Test with Shouldly: detect the framework, convert FluentAssertions, WebApplicationFactory.             |
| `rx-datadog-dotnet`      | Instrument a .NET service: tracer, service tags, log correlation, metrics, through an upgrade.         |
| `rx-datadog-investigate` | Go from an alert to the failing span and its logs, before and after a deploy.                          |
| `rx-datadog-monitors`    | Manage monitors, SLOs and dashboards as code, and keep them valid after renames.                       |

</details>

## Agents

Each agent gets the fewest tools its job needs and a model sized to it. Read-only agents cannot
edit, so a reviewer never "fixes" what it was asked to review.

| Agent                | Model  | Edits | Use it to                                                               |
| -------------------- | :----: | :---: | ----------------------------------------------------------------------- |
| `rx-planner`         | fable  |   —   | Turn a request into a sliced plan grounded in the code.                 |
| `rx-architect`       | fable  |   —   | Design the system for a time-boxed build: parts, data, boundaries.      |
| `rx-security`        | fable  |   —   | Find what would embarrass the demo: secrets, auth gaps, RLS, injection. |
| `rx-reviewer`        |  opus  |   —   | Review a diff and report only defects it can back.                      |
| `rx-researcher`      |  opus  |   —   | Answer "how do I do X with Y" from official docs, with sources.         |
| `rx-dotnet-reviewer` |  opus  |   —   | Review a .NET diff: async, DI lifetimes, EF Core, upgrade behaviour.    |
| `rx-observability`   |  opus  |   —   | Investigate production in Datadog and report with evidence.             |
| `rx-builder`         |  opus  |   ✓   | Build one slice end to end, with tests.                                 |
| `rx-debugger`        |  opus  |   ✓   | Find a bug's root cause and fix it with a regression test.              |
| `rx-test-writer`     |  opus  |   ✓   | Add tests that check behaviour.                                         |
| `rx-build-fixer`     |  opus  |   ✓   | Turn a red build green with the smallest honest diff.                   |
| `rx-ui`              |  opus  |   ✓   | Build and polish UI: responsive, accessible, every state.               |
| `rx-db`              |  opus  |   ✓   | Design schemas, migrations, policies and demo seed data.                |
| `rx-deployer`        |  opus  |   ✓   | Ship to the chosen platform and prove the live URL works.               |
| `rx-pitch`           |  opus  |   ✓   | Write the demo script and the pitch.                                    |
| `rx-dotnet-migrator` |  opus  |   ✓   | Upgrade one .NET service to .NET 10, with a per-service log.            |
| `rx-fe-builder`      |  opus  |   ✓   | Build React features in the repo's own conventions, and verify them.    |
| `rx-fe-reviewer`     |  opus  |   —   | Review React: hooks, effects, re-renders, state, a11y, bundle size.     |
| `rx-qa-tester`       |  opus  |   ✓   | Explore the running app against a charter; report bugs with evidence.   |
| `rx-qa-flake-hunter` |  opus  |   ✓   | Fix a flaky test at its root and prove it with repeat runs.             |
| `rx-mkt-advisor`     | fable  |   ✓   | A CEO's second opinion: test plans against the goal, cut, write memos.  |
| `rx-mkt-marketer`    |  opus  |   ✓   | Write positioning, landing and launch copy from what the code does.     |
| `rx-mkt-copywriter`  |  opus  |   ✓   | Rewrite in-app copy to the voice guide; strings only, never logic.      |
| `rx-scout`           | sonnet |   —   | Find where things live without flooding the context.                    |
| `rx-doc-writer`      | sonnet |   ✓   | Write a README a newcomer can follow in five minutes.                   |

`rx-observability` has no tool list on purpose, so it can reach the Datadog MCP server; it changes
nothing unless asked.

## Commands

| Command                     | What it does                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| `rxova-agent-kit list`      | Every agent, skill and hook, the profiles that include it, and what it is for.                         |
| `rxova-agent-kit install`   | Installs a profile, or updates an existing install.                                                    |
| `rxova-agent-kit uninstall` | Removes the files each install wrote and its hook entries in `settings.json`. Nothing else is touched. |
| `rxova-agent-kit status`    | Each installed target's profile and version, and anything missing or edited. Exits 1 when out of step. |

| Flag            | Commands                         | Effect                                                                                  |
| --------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `--profile <p>` | `install`, `list`                | `core` (default on a first install), `hackathon`, `dotnet`, `full`.                     |
| `--target <t>`  | `install`, `uninstall`, `status` | `claude` (default on a first install), `opencode` or `both`. Later: the installed ones. |
| `--add a,b`     | `install`                        | Adds items on top of the profile.                                                       |
| `--skip c`      | `install`                        | Leaves items out of the profile.                                                        |
| `--statusline`  | `install`                        | Sets Claude Code's status line to the kit's script; `--no-statusline` takes it out.     |
| `--project`     | `install`, `uninstall`, `status` | Works on `./.claude` or `./.opencode` instead of the user folder.                       |
| `--dry-run`     | `install`, `uninstall`           | Prints the plan and writes nothing.                                                     |
| `--force`       | `install`                        | Overwrites files (and a status line) the kit did not write.                             |

| Target     | User install                                          | With `--project` |
| ---------- | ----------------------------------------------------- | ---------------- |
| `claude`   | `~/.claude`                                           | `./.claude`      |
| `opencode` | `~/.config/opencode` (or `$XDG_CONFIG_HOME/opencode`) | `./.opencode`    |

Each target records what the install wrote in `rx-ai/manifest.json`. The install refuses to
overwrite a file it did not write, and reads and checks `settings.json` before writing anything.

## OpenCode

`--target opencode` (or `both`) installs the same kit for OpenCode:

- **Agents** become OpenCode subagents (`mode: subagent`); the tools an agent was not given become
  a `permission` block. They run on the model of the agent that calls them.
- **Skills** use the same `SKILL.md` format. OpenCode also reads `.claude/skills/`, so with
  `--target both` they are written once.
- **Hooks** run through `plugins/rx-kit.js`, which calls the same runner: a guard fails the tool
  call with its message, `quick-check` appends its report to the edit's output, and
  `handoff-reminder` adds its pointer to the system prompt. `apply_patch` edits are checked file by
  file.

`context-nudge` and the session-end snapshot do not run there: OpenCode has no transcript file to
measure and no session-end event. Restart OpenCode after installing.

## Programmatic use

The package exports what the bin is built from: `runHook`, `runHooks`, `hooks`, `catalog`,
`profiles`, `selectItems`, `resolveTargets`, `planInstall`, `installCopies`, `hookGroups`,
`withOwnHooks`, `withoutOwnHooks`, `opencodeAgent`, `opencodeHooks`, `opencodePlugin`, and their
types.

## License

[MIT](LICENSE)

# @rxova/agent-kit

A kit for Claude Code and OpenCode, for building fast without breaking things: new products on
a deadline, and backend services moved from .NET 6 and 8 to .NET 10.

- **10 hooks**: 6 guards that stop the costly mistakes (bypassing git hooks, AI attribution,
  destroying data or work, leaking keys, hanging on a dev server, loosening lint rules), plus
  4 helpers that format and lint every edit, save session snapshots, point new sessions at the
  last handoff, and warn before the context fills up;
- **34 skills**: workflow (kickoff to demo), stacks (React, Node, Python, Expo, the Claude API,
  UI, auth), platforms (Supabase, Postgres, Vercel, Cloudflare, containers, AWS), .NET (the
  upgrade to .NET 10, ASP.NET Core, EF Core, workers, testing with Shouldly) and Datadog
  (instrumenting, investigating, monitors);
- **18 agents**, each with the fewest tools and the cheapest model its job needs.

Install a profile, not everything: every installed agent and skill description is loaded into
every session.

```sh
npx @rxova/agent-kit install --profile hackathon            # everything for building a product fast
npx @rxova/agent-kit install --profile dotnet --target both # .NET and Datadog, for Claude Code and OpenCode
npx @rxova/agent-kit install                                 # core: the guards and the everyday set
npx @rxova/agent-kit list                                    # every item, and which profiles include it
```

## How it works

You install once. After that you talk to Claude as usual, and the kit works at three levels:

| Part       | Who starts it                             | How                                                                                                                                                 |
| ---------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Hooks**  | Claude Code, on its own                   | They fire on events: before a command or an edit, after an edit, at session start and end, before compaction. Neither you nor Claude calls them.    |
| **Skills** | Claude, when your request matches; or you | Claude reads each skill's description and loads the skill when it fits. Type `/rx-kickoff`, `/rx-demo`, … to load one yourself.                     |
| **Agents** | Claude, when a task matches; or you       | Claude hands work to an agent whose description fits, and gets a summary back. Say "use rx-architect" or "have rx-reviewer check this" to pick one. |

Restart Claude Code after installing so it loads the new agents, skills and hooks. A guard only
watches Claude's own tool calls: when it blocks something you really want, run it yourself in
a terminal, or switch that guard off for the session (see [Hooks](#hooks)). Skills and agents
are picked by how well a request matches their description, so name one when it matters.

### Example: a new product on a deadline

1. **"We're building a split-the-bill app for group trips, 24 hours. Let's kick off."**
   Claude follows `rx-kickoff`: the demo moment, one golden path, a boring stack, a
   `CLAUDE.md`, a deploy in the first hour. `rx-architect` designs the data model, and
   `rx-slice` cuts the work into slices and stops for your go-ahead.
2. **"Go, slice 1."** `rx-builder` builds it. After every edit `quick-check` lints the file and
   Claude fixes what it reports. `pnpm dev` in the foreground is stopped by `dev-server` and
   rerun in the background; a Supabase key written into a source file is stopped by
   `secret-guard` and moved to `.env`; a `--no-verify` commit is stopped by `no-bypass`.
   `rx-ship` opens the pull request the repository's way.
3. **Hour 14.** `context-nudge` says the context is 60% full; Claude writes a handoff note
   (`rx-handoff`). Before the compact, `memory-snapshot` saves where things stand, and next
   session `handoff-reminder` points Claude at it.
4. **"Login works locally but not on Vercel."** Claude follows `rx-debug` and
   `rx-deploy-vercel`. A panicked `git reset --hard` on uncommitted work is stopped by
   `danger-zone`.
5. **"Get us demo-ready."** `rx-security-sweep` and the `rx-security` agent check for leaks and
   missing row-level security, `rx-demo` adds seed data and a click-by-click script, and
   `rx-pitch` writes the pitch.

### Example: moving a service to .NET 10

1. **"Upgrade the orders service from .NET 6 to .NET 10."** Claude follows `rx-dotnet-upgrade`:
   an inventory of projects, packages, images and CI; a green baseline first; then the SDK, the
   target framework and the packages. The `rx-dotnet-migrator` agent works through build errors
   and breaking changes one area at a time, keeping a per-service log.
2. **Tests.** `rx-dotnet-testing` finds which framework and mocking library the repository uses,
   converts FluentAssertions leftovers to Shouldly, and adds WebApplicationFactory and
   Testcontainers tests where the upgrade changed behaviour. `quick-check` formats every edited
   `.cs` file; `dotnet run` in the foreground is stopped by `dev-server`, and
   `dotnet ef database drop` by `danger-zone`.
3. **Observability.** `rx-datadog-dotnet` checks the tracer supports .NET 10 and that service,
   env and version tags still line up; after the deploy, the `rx-observability` agent compares
   error rate and latency before and after the new version through the Datadog MCP server
   (`rx-datadog-investigate`), and `rx-datadog-monitors` updates monitors on renamed resources.
4. **Review and ship.** `rx-dotnet-reviewer` checks the diff for async and DI mistakes, EF Core
   query and migration safety, and behaviour the framework change altered; `rx-ship` opens the
   pull request.

## Commands

| Command                                                                                                       | What it does                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rxova-agent-kit list [--profile p]`                                                                          | Every agent, skill and hook, the profiles that include it, and what it is for.                                                                                                                                                                                                                                                       |
| `rxova-agent-kit install [--target t] [--profile p] [--add a,b] [--skip c] [--project] [--dry-run] [--force]` | Installs a profile, with items added or skipped, for Claude Code (`--target claude`, the default on a first install), OpenCode (`opencode`) or both. Run again to update: with no `--target` it updates the targets already installed, and with no `--profile` it keeps each one's last selection, so `--add x` alone adds one item. |
| `rxova-agent-kit uninstall [--target t] [--project] [--dry-run]`                                              | Removes the files each install wrote and its hook entries in `settings.json`. Every other file and setting is left as it was. With no `--target`, every installed target.                                                                                                                                                            |
| `rxova-agent-kit status [--target t] [--project]`                                                             | Shows each installed target's profile and version, and any file that is missing or edited, or hook that is missing. Exits 1 when anything is out of step.                                                                                                                                                                            |

| Target     | User install                                          | With `--project` |
| ---------- | ----------------------------------------------------- | ---------------- |
| `claude`   | `~/.claude`                                           | `./.claude`      |
| `opencode` | `~/.config/opencode` (or `$XDG_CONFIG_HOME/opencode`) | `./.opencode`    |

Each target records what the install wrote in its `rx-ai/manifest.json`. The install refuses to
overwrite a file it did not write (unless `--force`), reads and checks `settings.json` before
writing anything, and prints its plan without writing under `--dry-run`.

## Profiles

| Profile     | What it holds                                                                                                                                                                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`      | The 6 guards; `rx-planner`, `rx-reviewer`, `rx-scout`, `rx-builder`, `rx-debugger`, `rx-build-fixer`; `rx-verify`, `rx-handoff`, `rx-slice`, `rx-debug`, `rx-ship`.                                                                            |
| `hackathon` | Everything for building a product fast: all but `rx-tdd`, `rx-theme-audit` and the .NET and Datadog set.                                                                                                                                       |
| `dotnet`    | `core`, plus the .NET, EF Core and Datadog skills and agents, and `rx-architect`, `rx-test-writer`, `rx-security`, `rx-researcher`, `rx-parallel`, `rx-tdd`, `rx-security-sweep`, `rx-postgres`, `rx-deploy-container` and the 4 helper hooks. |
| `full`      | Everything.                                                                                                                                                                                                                                    |

## Hooks

Every hook runs through one bundled file, `.claude/rx-ai/hooks.js`, that imports only Node
(no `npx` per call, about 80 ms each). A guard that blocks exits 2 and tells the agent why and
what to do instead. On anything unexpected (unreadable input, a crash) a hook lets the call
through: it never blocks a session because of its own failure.

| Hook               | When                           | What it does                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `no-bypass`        | before Bash                    | Blocks git calls that skip the repository's hooks: `--no-verify`, `git commit -n`, `HUSKY=0`, setting or clearing `core.hooksPath`.                                                                                                                                                                                                  |
| `no-attribution`   | before Bash                    | Blocks `git commit` messages and `gh pr create`/`edit` bodies that credit an AI assistant: a `Co-Authored-By` naming Claude, a session trailer, a "Generated with Claude" footer, the robot emoji. Message and body files are read too.                                                                                              |
| `danger-zone`      | before Bash                    | Blocks `rm -r` outside the project (or on an unexpanded variable), force pushes to `main`/`master`/`production`, `reset --hard` and friends on a dirty tree, SQL `DROP`/`TRUNCATE`, remote database resets, `dotnet ef database drop` or `update 0`, and cloud teardown (`terraform destroy`, `aws … delete-*`, `fly … destroy`, …). |
| `dev-server`       | before Bash                    | Blocks dev servers and watchers started in the foreground (`pnpm dev`, `vite`, `uvicorn`, `dotnet run`, `dotnet watch`, `docker compose up`, …), and says to use `run_in_background`.                                                                                                                                                |
| `config-lock`      | before Edit/Write              | Blocks edits to an existing lint, format, type, commit or coverage config (including `stylecop.json`, `.ruleset` and `.globalconfig`). Creating one is fine. `Directory.Build.props` and `Directory.Packages.props` stay editable: a framework upgrade has to change them.                                                           |
| `secret-guard`     | before Edit/Write              | Blocks writing an API key, token or private key into a source file (AWS, Anthropic, OpenAI, Stripe live, GitHub, Slack, Google, Datadog, Azure storage, Supabase secret and service-role keys). `.env` files are where they belong, so writes there pass.                                                                            |
| `quick-check`      | after Edit/Write               | Formats the edited file and lints it with the project's own tools (Biome, or Prettier and ESLint; Ruff for Python; `dotnet format whitespace` for C#, which needs no build) and reports lint problems straight back to the agent. Does nothing on Windows.                                                                           |
| `memory-snapshot`  | before compaction, session end | Saves a snapshot (branch, uncommitted files, recent commits, files edited, the last requests) to `.claude/handoff/auto/`, git-ignored, keeping the last ten.                                                                                                                                                                         |
| `handoff-reminder` | session start                  | Points the agent at the newest handoff note in `.claude/handoff/` (a week at most), or the newest snapshot (two days).                                                                                                                                                                                                               |
| `context-nudge`    | after any tool                 | At 60% and again at 80% of the context window, tells the agent to reach a break, write a handoff note and suggest `/compact`.                                                                                                                                                                                                        |

Settings, as environment variables:

- `RX_AI_OFF=config-lock,quick-check` switches hooks off, for example for one session:
  `RX_AI_OFF=config-lock claude`.
- `RX_AI_CONTEXT_WINDOW=1000000` sets the window size `context-nudge` measures against
  (200,000 by default).

## OpenCode

`--target opencode` (or `both`) installs the same kit for OpenCode:

- **Agents** go to `agents/` as OpenCode subagents: `mode: subagent`, and the tools an agent was
  not given become a `permission` block (`edit`, `bash`, `webfetch`, `websearch` denied). They
  run on the model of the agent that calls them, as OpenCode's subagents do by default.
- **Skills** use the same `SKILL.md` format. OpenCode also reads `.claude/skills/`, so with
  `--target both` they are written once, for Claude Code.
- **Hooks** run through `plugins/rx-kit.js`, which OpenCode loads on start. It calls the same
  runner: a guard blocks by failing the tool call with its message, `quick-check` appends its
  report to the edit's output, `memory-snapshot` runs when a session is compacted, and
  `handoff-reminder`'s pointer is added to the new session's system prompt. OpenCode's
  `apply_patch` edits are checked file by file.

Two hooks have no OpenCode equivalent and do not run there: `context-nudge` (OpenCode has no
transcript file to measure) and the session-end snapshot (there is no session-end event). Restart
OpenCode after installing.

## Skills

Each skill is a folder with a `SKILL.md`: when to use it, the steps, and an example.

**Workflow**

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

**Stacks**

| Skill           | Use it to                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------- |
| `rx-react-web`  | Build with Next.js or Vite: rendering, data fetching, forms, env vars.                        |
| `rx-ui-kit`     | Get a good-looking, accessible UI fast with Tailwind and shadcn/ui, dark mode included.       |
| `rx-node-api`   | Build a typed API with Hono (or Fastify/Express): validation, errors, auth, CORS, tests.      |
| `rx-python-api` | Build an API with FastAPI and uv: models, dependencies, async database, tests, Docker.        |
| `rx-expo`       | Ship a React Native app with Expo: routing, devices, env vars, auth, EAS.                     |
| `rx-claude-api` | Add AI features with the Claude API: streaming, tools, structured output, caching, cost caps. |
| `rx-auth`       | Pick and wire authentication fast, with a seeded demo account.                                |

**Platforms**

| Skill                  | Use it to                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| `rx-supabase`          | Use Supabase: local dev, migrations, row-level security, storage, edge functions, types. |
| `rx-postgres`          | Use Postgres with Drizzle or Prisma: schema, migrations, pooling, indexes, seeds.        |
| `rx-deploy-vercel`     | Deploy to Vercel or Netlify: previews, env vars, monorepos, limits, rollback.            |
| `rx-deploy-cloudflare` | Deploy Workers and Pages with wrangler: bindings, secrets, D1, R2, KV.                   |
| `rx-deploy-container`  | Deploy containers to Fly.io, Railway or anywhere Docker runs.                            |
| `rx-aws`               | Take the fast paths on AWS, with a budget alarm first and a teardown list last.          |

**.NET**

| Skill               | Use it to                                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `rx-dotnet-upgrade` | Move a service from .NET 6 or 8 to .NET 10: inventory, baseline, SDK and packages, breaking changes, images, CI. |
| `rx-dotnet-api`     | Build and upgrade ASP.NET Core APIs: minimal APIs or controllers, validation, ProblemDetails, auth, OpenAPI.     |
| `rx-efcore`         | Upgrade and use EF Core safely: breaking changes, migrations and production scripts, providers, performance.     |
| `rx-dotnet-workers` | Run hosted services and messaging reliably: shutdown, scopes, retries, idempotency, outbox, brokers.             |
| `rx-dotnet-testing` | Test with Shouldly: detect the framework, convert FluentAssertions, WebApplicationFactory, Testcontainers.       |

**Datadog**

| Skill                    | Use it to                                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `rx-datadog-dotnet`      | Instrument a .NET service with the tracer, service tags, log correlation and metrics, and keep it working through an upgrade.       |
| `rx-datadog-investigate` | Go from an alert or symptom to the failing span and its logs, before and after a deploy, through the Datadog MCP server or the API. |
| `rx-datadog-monitors`    | Manage monitors, SLOs and dashboards as code, and keep them valid after renames.                                                    |

## Agents

| Agent                | Model  | Can edit | Use it to                                                                                                                                                   |
| -------------------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rx-planner`         | opus   | no       | Turn a request into a sliced plan grounded in the code.                                                                                                     |
| `rx-architect`       | opus   | no       | Design the system for a time-boxed build: parts, data, boundaries.                                                                                          |
| `rx-security`        | opus   | no       | Find what would embarrass the demo: secrets, auth gaps, RLS, injection.                                                                                     |
| `rx-reviewer`        | sonnet | no       | Review a diff and report only defects it can back.                                                                                                          |
| `rx-researcher`      | sonnet | no       | Answer "how do I do X with Y" from official docs, with sources.                                                                                             |
| `rx-builder`         | sonnet | yes      | Build one slice end to end, with tests.                                                                                                                     |
| `rx-debugger`        | sonnet | yes      | Find a bug's root cause and fix it with a regression test.                                                                                                  |
| `rx-test-writer`     | sonnet | yes      | Add tests that check behaviour.                                                                                                                             |
| `rx-build-fixer`     | sonnet | yes      | Turn a red build green with the smallest honest diff.                                                                                                       |
| `rx-ui`              | sonnet | yes      | Build and polish UI: responsive, accessible, every state.                                                                                                   |
| `rx-db`              | sonnet | yes      | Design schemas, migrations, policies and demo seed data.                                                                                                    |
| `rx-deployer`        | sonnet | yes      | Ship to the chosen platform and prove the live URL works.                                                                                                   |
| `rx-pitch`           | sonnet | yes      | Write the demo script and the pitch.                                                                                                                        |
| `rx-scout`           | haiku  | no       | Find where things live without flooding the context.                                                                                                        |
| `rx-doc-writer`      | haiku  | yes      | Write a README a judge can follow in five minutes.                                                                                                          |
| `rx-dotnet-migrator` | sonnet | yes      | Upgrade one .NET service to .NET 10: baseline, change, build, fix, test, smoke, with a log.                                                                 |
| `rx-dotnet-reviewer` | sonnet | no       | Review a .NET diff: async, DI lifetimes, EF Core safety, behaviour the upgrade changed.                                                                     |
| `rx-observability`   | sonnet | no       | Investigate production behaviour in Datadog and report with evidence; changes nothing unless asked. Has no tool list, so it can use the Datadog MCP server. |

## Programmatic use

The package exports what the bin is built from: `runHook`, `runHooks`, `hooks`, `catalog`,
`profiles`, `selectItems`, `resolveTargets`, `planInstall`, `installCopies`, `hookGroups`,
`withOwnHooks`, `withoutOwnHooks`, `opencodeAgent`, `opencodeHooks`, `opencodePlugin`, and their
types.

## License

MIT

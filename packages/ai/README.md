# @rxova/ai

A Claude Code kit for building fast without breaking things, sized for a hackathon and useful
after it:

- **10 hooks**: 6 guards that stop the costly mistakes (bypassing git hooks, AI attribution,
  destroying data or work, leaking keys, hanging on a dev server, loosening lint rules), plus
  4 helpers that format and lint every edit, save session snapshots, point new sessions at the
  last handoff, and warn before the context fills up;
- **26 skills**: workflow (kickoff to demo), stacks (React, Node, Python, Expo, the Claude API,
  UI, auth) and platforms (Supabase, Postgres, Vercel, Cloudflare, containers, AWS);
- **15 agents**, each with the fewest tools and the cheapest model its job needs.

Install a profile, not everything: every installed agent and skill description is loaded into
every session.

```sh
npx @rxova/ai install --profile hackathon   # everything useful in a sprint
npx @rxova/ai install                        # core: the guards and the everyday set
npx @rxova/ai list                           # every item, and which profiles include it
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

### Example: a hackathon

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

## Commands

| Command                                                                                   | What it does                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rxova-ai list [--profile p]`                                                             | Every agent, skill and hook, the profiles that include it, and what it is for.                                                                                                                               |
| `rxova-ai install [--profile p] [--add a,b] [--skip c] [--project] [--dry-run] [--force]` | Installs a profile, with items added or skipped, into `~/.claude` (or `./.claude` with `--project`). Run again to update: with no `--profile`, the last selection is kept, so `--add x` alone adds one item. |
| `rxova-ai uninstall [--project] [--dry-run]`                                              | Removes the files the last install wrote and its hook entries in `settings.json`. Every other file and setting is left as it was.                                                                            |
| `rxova-ai status [--project]`                                                             | Shows the installed profile and version, and any file that is missing or edited, or hook that is missing. Exits 1 when anything is out of step.                                                              |

The install records what it wrote in `.claude/rx-ai/manifest.json`, refuses to overwrite a file
it did not write (unless `--force`), and prints its plan without writing anything under
`--dry-run`.

## Profiles

| Profile     | What it holds                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core`      | The 6 guards; `rx-planner`, `rx-reviewer`, `rx-scout`, `rx-builder`, `rx-debugger`, `rx-build-fixer`; `rx-verify`, `rx-handoff`, `rx-slice`, `rx-debug`, `rx-ship`. |
| `hackathon` | Everything except `rx-tdd` and `rx-theme-audit`.                                                                                                                    |
| `full`      | Everything.                                                                                                                                                         |

## Hooks

Every hook runs through one bundled file, `.claude/rx-ai/hooks.js`, that imports only Node
(no `npx` per call, about 80 ms each). A guard that blocks exits 2 and tells the agent why and
what to do instead. On anything unexpected (unreadable input, a crash) a hook lets the call
through: it never blocks a session because of its own failure.

| Hook               | When                           | What it does                                                                                                                                                                                                                                                                                |
| ------------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `no-bypass`        | before Bash                    | Blocks git calls that skip the repository's hooks: `--no-verify`, `git commit -n`, `HUSKY=0`, setting or clearing `core.hooksPath`.                                                                                                                                                         |
| `no-attribution`   | before Bash                    | Blocks `git commit` messages and `gh pr create`/`edit` bodies that credit an AI assistant: a `Co-Authored-By` naming Claude, a session trailer, a "Generated with Claude" footer, the robot emoji. Message and body files are read too.                                                     |
| `danger-zone`      | before Bash                    | Blocks `rm -r` outside the project (or on an unexpanded variable), force pushes to `main`/`master`/`production`, `reset --hard` and friends on a dirty tree, SQL `DROP`/`TRUNCATE`, remote database resets, and cloud teardown (`terraform destroy`, `aws … delete-*`, `fly … destroy`, …). |
| `dev-server`       | before Bash                    | Blocks dev servers and watchers started in the foreground (`pnpm dev`, `vite`, `uvicorn`, `docker compose up`, …), and says to use `run_in_background`.                                                                                                                                     |
| `config-lock`      | before Edit/Write              | Blocks edits to an existing lint, format, type, commit or coverage config. Creating one is fine.                                                                                                                                                                                            |
| `secret-guard`     | before Edit/Write              | Blocks writing an API key, token or private key into a source file (AWS, Anthropic, OpenAI, Stripe live, GitHub, Slack, Google, Supabase secret and service-role keys). `.env` files are where they belong, so writes there pass.                                                           |
| `quick-check`      | after Edit/Write               | Formats the edited file and lints it with the project's own tools (Biome, or Prettier and ESLint; Ruff for Python) and reports lint problems straight back to the agent. Does nothing on Windows.                                                                                           |
| `memory-snapshot`  | before compaction, session end | Saves a snapshot (branch, uncommitted files, recent commits, files edited, the last requests) to `.claude/handoff/auto/`, git-ignored, keeping the last ten.                                                                                                                                |
| `handoff-reminder` | session start                  | Points the agent at the newest handoff note in `.claude/handoff/` (a week at most), or the newest snapshot (two days).                                                                                                                                                                      |
| `context-nudge`    | after any tool                 | At 60% and again at 80% of the context window, tells the agent to reach a break, write a handoff note and suggest `/compact`.                                                                                                                                                               |

Settings, as environment variables:

- `RX_AI_OFF=config-lock,quick-check` switches hooks off, for example for one session:
  `RX_AI_OFF=config-lock claude`.
- `RX_AI_CONTEXT_WINDOW=1000000` sets the window size `context-nudge` measures against
  (200,000 by default).

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

## Agents

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

## Programmatic use

The package exports what the bin is built from: `runHook`, `hooks`, `catalog`, `profiles`,
`selectItems`, `planInstall`, `installCopies`, `hookGroups`, `withOwnHooks`, `withoutOwnHooks`,
and their types.

## License

MIT

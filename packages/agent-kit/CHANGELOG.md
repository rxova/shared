# @rxova/agent-kit

## 0.5.0

### Minor Changes

- [#90](https://github.com/rxova/shared/pull/90) [`0fe4f4c`](https://github.com/rxova/shared/commit/0fe4f4c610f3b5b658f54251e6c6e584a28585a8) - Draw the status line in OpenCode.
  
  `rxova-agent-kit statusline --target opencode` installs a TUI plugin that renders the same status
  line the Claude Code script draws: the model, project and git state, the context gauge with its
  trend and projected turns, the prompt cache, cost and elapsed time. It is registered in OpenCode's
  `cli.json` beside any plugins already there, and removed from it again with `--remove`.
  
  The segments now carry their colour as runs rather than as escape codes, so one set of builders
  feeds both hosts: `renderStatusline` paints them for Claude Code, and `statuslineRows` hands the
  same cells to OpenCode's renderer. The painted output is unchanged.
  
  The package takes no new dependency: the plugin names `@opencode/plugin/tui`, `@opentui/solid`
  and `solid-js` as bare imports, which OpenCode resolves itself.

### Patch Changes

- [#89](https://github.com/rxova/shared/pull/89) [`6e58f6f`](https://github.com/rxova/shared/commit/6e58f6f0926815f1606a24be80bc3855242c219a) - Every Claude Code mod carries agent-kit's version, set when packages are versioned, so `claude plugin update` picks up a release that changes a mod.

## 0.4.1

### Patch Changes

- [#86](https://github.com/rxova/shared/pull/86) [`5bc6205`](https://github.com/rxova/shared/commit/5bc620568138def10baf6d402ddedf3ed4ed1fd5) - rx-attribution judges only the commit `git commit` just made: it looks up the hash git printed where the command ran (every `cd` before the commit, then its `git -C`), and says nothing when that commit isn't there. A quiet commit (`-q`, no hash) is read from `HEAD` only when the command never left the session's own directory. It used to read the session's own `HEAD` and could ask to amend a correct commit.

## 0.4.0

### Minor Changes

- [#84](https://github.com/rxova/shared/pull/84) [`31232f4`](https://github.com/rxova/shared/commit/31232f434fe5d7622871acf2e6d9cd95cfdeb680) - danger-zone no longer judges hosting and cloud CLIs (Vercel, Fly, Railway, Cloudflare `wrangler`, AWS), so it behaves the same whichever platform a project deploys to. It still blocks `rm -r` outside the project, force pushes to `main`, discarding uncommitted work, SQL drops, database resets, `terraform destroy` and disk writes.

- [#79](https://github.com/rxova/shared/pull/79) [`c50e756`](https://github.com/rxova/shared/commit/c50e7562590200ebf1da3ea144ede8a60e435370) - The status line is rewritten as one dependency-free Node script: no `jq`, no Powerline font, rows that fit the terminal width, and far more data (prompt cache, pull request, effort, rate-limit pace, context trend). An install with `--statusline` replaces the older bash script in place.

- [#80](https://github.com/rxova/shared/pull/80) [`ba66937`](https://github.com/rxova/shared/commit/ba66937bc78f8b025a5f32bf6b1bbf6bd5d6d59e) - A `none` profile installs nothing on its own, for a machine that only wants the status line (`install --profile none --statusline`) or a hand-picked `--add`. The hook runner is now written only when a hook is chosen.

- [#81](https://github.com/rxova/shared/pull/81) [`ffa7782`](https://github.com/rxova/shared/commit/ffa77822f747cbf5ef8fb824af9d793e6591b4fb) - `rxova-agent-kit statusline` installs the status line on its own, with no agent, skill or hook; on a machine that already has the kit it keeps that install and switches the status line on. `--remove` takes it out again, and removes the kit when the status line was all there was.

### Patch Changes

- [#82](https://github.com/rxova/shared/pull/82) [`be01eef`](https://github.com/rxova/shared/commit/be01eefd3376ff805072e21577e747ae5e1bc7db) - The status line separates its segments with a heavy `┃` and single spaces instead of a padded `│`.

## 0.3.0

### Minor Changes

- [#63](https://github.com/rxova/shared/pull/63) [`579fe8e`](https://github.com/rxova/shared/commit/579fe8e39064abeb3febbf7093a2dd61084a00e5) - Add `install --statusline`: ships a two-line status line script (model, context bar, git detail, session cost, lines changed, plan usage) and sets Claude Code's `statusLine` to it; `--no-statusline` and uninstall take it out again.

## 0.2.2

### Patch Changes

- [#62](https://github.com/rxova/shared/pull/62) [`818466a`](https://github.com/rxova/shared/commit/818466a8dc07a7617ffc652c96fffa4801330b29) - Document the rx-attribution, rx-worktrees and rx-handoff-band Claude Code mods, installed from the rxova/shared marketplace.

## 0.2.1

### Patch Changes

- [#35](https://github.com/rxova/shared/pull/35) [`0cb1889`](https://github.com/rxova/shared/commit/0cb188991a6179508cd091c0286ba3297f30c737) - Point links at rxova.dev.

## 0.2.0

### Minor Changes

- [#18](https://github.com/rxova/shared/pull/18) [`28ae490`](https://github.com/rxova/shared/commit/28ae4904ca0037c08503577ae1d6ab3ec9356005) - Agents run on stronger models: the planning, architecture, security and advisor agents move to Fable, every agent that was on Sonnet moves to Opus, and `rx-scout` and `rx-doc-writer` move from Haiku to Sonnet.

- [#18](https://github.com/rxova/shared/pull/18) [`9850140`](https://github.com/rxova/shared/commit/9850140c43a4302cd7ce0483f2391797987b3e80) - Add three sets, each with its own profile: `rx-fe-*` for React (Redux Toolkit, code splitting, hooks, performance, state, testing; `react`), `rx-qa-*` for quality assurance (test plans, exploratory testing, bug reports, regression, flaky tests, accessibility; `qa`), and `rx-mkt-*` for marketing, the CEO's view and in-app language (positioning, landing copy, launch, voice; `marketing`). 17 skills and 7 agents in all; `hackathon` leaves the three sets out.

## 0.1.0

### Minor Changes

- [#12](https://github.com/rxova/shared/pull/12) [`fb06578`](https://github.com/rxova/shared/commit/fb065785ee6a2a7665decb22ebac687de3fd4ce1) - Add `@rxova/agent-kit`, a kit for Claude Code and OpenCode installed in profiles (`core`, `hackathon`, `dotnet`, `full`) by the `rxova-agent-kit` bin (`list`, `install`, `uninstall`, `status`, with `--target claude|opencode|both`):
  
  - hooks: the guards `no-bypass`, `no-attribution`, `danger-zone`, `dev-server`, `config-lock` and `secret-guard`, and the helpers `quick-check`, `memory-snapshot`, `handoff-reminder` and `context-nudge`; in OpenCode they run through a generated plugin;
  - 34 skills for the workflow from kickoff to demo; for React, Node, Python, Expo, the Claude API, UI and auth; for Supabase, Postgres, Vercel, Cloudflare, containers and AWS; for moving .NET services to .NET 10 (ASP.NET Core, EF Core, workers, testing with Shouldly); and for Datadog;
  - 18 agents, each with the fewest tools and the cheapest model its job needs.

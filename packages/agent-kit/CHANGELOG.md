# @rxova/agent-kit

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

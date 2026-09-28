# @rxova/agent-kit

## 0.1.0

### Minor Changes

- [#12](https://github.com/rxova/shared/pull/12) [`fb06578`](https://github.com/rxova/shared/commit/fb065785ee6a2a7665decb22ebac687de3fd4ce1) - Add `@rxova/agent-kit`, a kit for Claude Code and OpenCode installed in profiles (`core`, `hackathon`, `dotnet`, `full`) by the `rxova-agent-kit` bin (`list`, `install`, `uninstall`, `status`, with `--target claude|opencode|both`):
  
  - hooks: the guards `no-bypass`, `no-attribution`, `danger-zone`, `dev-server`, `config-lock` and `secret-guard`, and the helpers `quick-check`, `memory-snapshot`, `handoff-reminder` and `context-nudge`; in OpenCode they run through a generated plugin;
  - 34 skills for the workflow from kickoff to demo; for React, Node, Python, Expo, the Claude API, UI and auth; for Supabase, Postgres, Vercel, Cloudflare, containers and AWS; for moving .NET services to .NET 10 (ASP.NET Core, EF Core, workers, testing with Shouldly); and for Datadog;
  - 18 agents, each with the fewest tools and the cheapest model its job needs.

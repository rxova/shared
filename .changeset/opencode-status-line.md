---
"@rxova/agent-kit": minor
---

Draw the status line in OpenCode.

`rxova-agent-kit statusline --target opencode` installs a TUI plugin that renders the same status
line the Claude Code script draws: the model, project and git state, the context gauge with its
trend and projected turns, the prompt cache, cost and elapsed time. It is registered in OpenCode's
`cli.json` beside any plugins already there, and removed from it again with `--remove`.

The segments now carry their colour as runs rather than as escape codes, so one set of builders
feeds both hosts: `renderStatusline` paints them for Claude Code, and `statuslineRows` hands the
same cells to OpenCode's renderer. The painted output is unchanged.

The package takes no new dependency: the plugin names `@opencode/plugin/tui`, `@opentui/solid`
and `solid-js` as bare imports, which OpenCode resolves itself.

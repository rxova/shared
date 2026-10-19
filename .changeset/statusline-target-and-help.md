---
"@rxova/agent-kit": patch
---

Load the OpenCode status line, fix `statusline --target`, and answer `--help` on a command.

The OpenCode status line plugin imported `@opencode/plugin/tui`, which failed to resolve and
stopped the plugin loading at all: that package is a dependency a published plugin installs for
itself, and a plugin written straight into the config directory has no `node_modules` to find it
in. Nothing was lost by dropping it — `Plugin.define` is `(plugin) => plugin`, a typing helper
with no runtime behaviour — so the definition is exported directly.

`statusline` read the manifest from the Claude Code directory whatever target it was given, so
`statusline --target opencode` on a machine that already had the kit in Claude Code installed the
`core` profile into OpenCode — agents, skills and hooks nobody asked for. Each target is now
decided on its own manifest: `none` plus the status line where the kit has never been, the
existing selection where it has.

`rxova-agent-kit <command> --help` printed `Unknown option '--help'`, because the command parsed
it before anything could answer it. It now prints that command's own usage, and `statusline`'s
options list `--target`, which it had been missing since the option was added.

An install that switches the status line on says so, instead of reporting only the agents and
skills it kept.

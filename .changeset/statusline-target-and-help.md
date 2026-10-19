---
"@rxova/agent-kit": patch
---

Make the OpenCode plugins load, fix `statusline --target`, and answer `--help` on a command.

**The status line never loaded.** It was written as a lone `index.js` with no manifest, so nothing
installed what it imports and the first import failed the whole plugin. It is now a plugin
directory: a `package.json` that makes OpenCode install the rendering modules, a server-safe entry
at `.`, and the TUI entry at `./tui` — the host loads a plugin in both runtimes, and only the TUI
one has `context.ui` to draw into. OpenTUI is pinned to a line rather than an open range, because
two copies in one process both register `OPENTUI_FORCE_UNICODE` and that is fatal on import. The
`@opencode/plugin` import is gone: `Plugin.define` is `(plugin) => plugin`, so nothing was lost.

**The hooks plugin never loaded on OpenCode 2.** It was written for version 1, which takes every
exported function as a plugin and returns a map of hooks. Version 2 reads the default export,
wants `{ id, setup }`, and registers through domains. The generated file now carries both shapes,
so either major loads it: `RxKit` stays a named function, and the definition is exported by
default. Each loader ignores the other's shape.

**`statusline` read the manifest from the Claude Code directory whatever target it was given**, so
`statusline --target opencode` on a machine that already had the kit in Claude Code installed the
`core` profile into OpenCode — agents, skills and hooks nobody asked for. Each target is now
decided on its own manifest.

**`rxova-agent-kit <command> --help` printed `Unknown option '--help'`**, because the command
parsed it before anything could answer. It now prints that command's own usage, and `statusline`'s
options list `--target`, which they had been missing since the option was added.

An install that switches the status line on says so, instead of reporting only the agents and
skills it kept.

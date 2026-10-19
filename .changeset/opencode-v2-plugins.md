---
"@rxova/agent-kit": patch
---

Make both OpenCode plugins load on version 2.

**The status line was not a plugin directory.** It was a lone `index.js` with no manifest, so
nothing installed what it imports. It is now a directory: a `package.json` that makes OpenCode
install the rendering modules, a server-safe entry at `.`, and the TUI entry at `./tui` — the host
loads a plugin in both runtimes, and only the TUI one has `context.ui` to draw into, so a single
entry holding the component failed the server load every time. OpenTUI is pinned to a line rather
than an open range: the host bundles its own copy, and two copies in one process both register
`OPENTUI_FORCE_UNICODE`, which is fatal on import.

**The hooks plugin was written for version 1**, which takes every exported function as a plugin
and returns a map of hooks. Version 2 reads the default export, wants `{ id, setup }`, and
registers through domains. The generated file now carries both shapes, so either major loads it:
`RxKit` stays a named function, and the definition is exported by default. Each loader ignores the
other's shape. The session-start reminder rides the session's first context rather than being
stashed on an event and injected later.

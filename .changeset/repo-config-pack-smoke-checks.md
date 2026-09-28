---
'@rxova/repo-config': minor
---

`pack-smoke` finds nested and glob `files` entries in the tarball, resolves `workspace:` peers and optional dependencies, and fails when an `exports` target is missing, when sources or tests ship unlisted, or when a built entry drops its source's `'use client'` directive. `baseVitestConfig` takes `thresholds`, `coverageInclude` and `testExclude`.

`check-changeset` and `check-scope` now see both sides of a rename, so a shipped file moved out of its package still needs a changeset.

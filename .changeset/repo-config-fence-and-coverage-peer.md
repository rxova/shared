---
"@rxova/repo-config": patch
---

`check-snippets` no longer reads a ` ```json ` fence as ` ```js `, so JSON fences stop being reported as unparseable. `@vitest/coverage-v8`, which the vitest preset's coverage uses, is now declared as an optional peer dependency (`>=3`, matching `vitest`).

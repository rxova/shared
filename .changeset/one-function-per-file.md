---
'@rxova/repo-config': minor
---

One function per file, named after it, grouped in topic folders and imported as `@/<topic>/<file>` (the eslint preset now rejects relative imports, and the vitest preset takes `root` and maps `@/` and `@rxova-<workspace>/`), and only public functions in the package: everything used internally moves to the private `@rxova/helpers` workspace and is bundled in. The library API changes with it: `verify` is now `runSteps`, `STEPS` is `defaultSteps()`, and `SKIP_LABEL`, `PAGE_BUNDLE_FILENAME` and `packagesNamed` are no longer exported. The `rxova-repo-config` commands are unchanged.

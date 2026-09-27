---
'@rxova/tooling': minor
---

One function per file, named after it, and only public functions in the package: everything used internally moves to the private `@rxova/helpers` workspace and is bundled in. The library API changes with it: `verify` is now `runSteps`, `STEPS` is `defaultSteps()`, and `SKIP_LABEL`, `PAGE_BUNDLE_FILENAME` and `packagesNamed` are no longer exported. The `rxova-tooling` commands are unchanged.

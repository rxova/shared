# @rxova/repo-config

## 0.1.0

### Minor Changes

- [#8](https://github.com/rxova/shared/pull/8) [`6862335`](https://github.com/rxova/shared/commit/68623359553f1aa31c39eb42e30c0ee8105e6276) - One function per file, named after it, grouped in topic folders and imported as `@/<topic>/<file>` (the eslint preset now rejects relative imports, and the vitest preset takes `root` and maps `@/` and `@rxova-<workspace>/`), and only public functions in the package: everything used internally moves to the private `@rxova/helpers` workspace and is bundled in. The library API changes with it: `verify` is now `runSteps`, `STEPS` is `defaultSteps()`, and `SKIP_LABEL`, `PAGE_BUNDLE_FILENAME` and `packagesNamed` are no longer exported. The `rxova-repo-config` commands are unchanged.

- [#6](https://github.com/rxova/shared/pull/6) [`d8a0b89`](https://github.com/rxova/shared/commit/d8a0b894a16b95f980f723973f407462e63fdf98) - Publish the repo scripts as `@rxova/repo-config`, with an `rxova-repo-config` bin:
  `verify`, `check-changeset`, `check-scope`, `node-floor`, `pack-smoke` and `check-llms`. Also ship the tsdown, vitest, eslint, commitlint and prettier presets.

- [#7](https://github.com/rxova/shared/pull/7) [`6df9e45`](https://github.com/rxova/shared/commit/6df9e4507f273da585b3da3a83d8d2e44a0bc03c) - Export the shared TypeScript base as `@rxova/repo-config/tsconfig.base.json`, so a repository extends it instead of carrying its own copy.

### Patch Changes

- [#10](https://github.com/rxova/shared/pull/10) [`80a6ef6`](https://github.com/rxova/shared/commit/80a6ef6a122ad108d48b7f42551ae2db3f46ec9f) - The internal helpers move from a separate private workspace into `src/internal/`, and the vitest preset maps only `@/`. No change to the exports or the commands.

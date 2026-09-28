---
"@rxova/repo-config": minor
---

New commands, so a repository deletes its copied scripts: `pre-push`, `lint-changesets`, `add-changeset`, `version`, `check-majors`, `check-exports`, `post-publish-smoke`, `check-tsdoc`, `check-banned`, `check-snippets`, `check-test-scripts`, `check-file-size`, `coverage-summary` and `list-packages`. `verify` steps take `skipOnRelease` and fold into log groups on GitHub Actions; `check-changeset` takes `changeset.scope: "shipped"` and lints the changesets it finds; `pack-smoke` reads a package's own `repoConfig.packSmoke` (`load`, `bins`, `run`), probes subpath-only packages and checks stylesheet imports; `check-llms` takes `repoConfig.llms` (`api`, `entries`, `sections`, `requiredTerms`, `idsFrom`/`idPattern`, `rootIndex`) with per-package overrides. New exports: `parsePackageConfig`, `readPackageConfig` and the config types. `check-llms` now accepts `## Use` in place of `## Install`.

---
"@rxova/repo-config": minor
---

Add `rxova-repo-config check-bundle`: a package's built entries, and the chunks they import, may
not mention an identifier from `repoConfig.bundle.banned` (`process` by default). Comments and
property reads are ignored, so only a free global a consumer's bundler would have to resolve is
reported. Added to the default verify gate as `pnpm run --if-present check:bundle`.

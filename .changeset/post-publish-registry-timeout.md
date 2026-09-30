---
"@rxova/repo-config": minor
---

Add `repoConfig.postPublish.registryTimeoutMinutes`, so `post-publish-smoke` can wait longer than its default 10 minutes for npm to serve a release. The registry has been seen taking over 30 minutes to list a published version.

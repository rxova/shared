---
"@rxova/repo-config": minor
---

Add `verify --keep-going`, a `fix-lockfile` command for Dependabot lockfile repairs, a `version-pr` command that opens or updates the version pull request, a `dependabot-update-type` command that reads the highest update type of a Dependabot commit, private-repository setup in `init` (including adding the repository to the `rxova-bot` installation), and make `check-changeset` require changesets for private packages when `changeset.includePrivate` is set.

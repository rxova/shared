---
"@rxova/repo-config": patch
---

Reading `package.json#repository` takes linear time: the owner in `github.com[/:]<owner>/<name>` no longer matches `:`, so a long run of hosts can't make the pattern retry from every position.

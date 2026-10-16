---
"@rxova/agent-kit": patch
---

rx-attribution reads the new commit where it was made: it follows every `cd` before `git commit` (and its `git -C`), and skips the check when the directory comes from a variable, `~` or `cd -`, instead of reading the session's own `HEAD` and flagging a correct commit.

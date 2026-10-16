---
"@rxova/agent-kit": patch
---

rx-attribution judges only the commit `git commit` just made: it looks up the hash git printed where the command ran (every `cd` before the commit, then its `git -C`), and says nothing when that commit isn't there. A quiet commit (`-q`, no hash) is read from `HEAD` only when the command never left the session's own directory. It used to read the session's own `HEAD` and could ask to amend a correct commit.

---
name: rx-handoff
description: Writes a handoff note that lets a fresh session pick the work up without re-discovering it, and resumes from one. Use before clearing or compacting context mid-task, at the end of a session with work left, or when asked to continue from a previous session.
---

# rx-handoff

Context runs out; knowledge should not. A handoff note is the smallest document that lets the
next session continue as if it had been here.

## When to use

- The conversation is long and the remaining work is clear: write a note, then start fresh.
- You are stopping with work unfinished.
- Resuming: the user points at a note, or `.claude/handoff/` has a recent one for this task.

## Writing a note

Save it as `.claude/handoff/<yyyy-mm-dd>-<short-topic>.md` in the project, and show the user
the path. Use these sections, and keep each one short:

- **Goal**: what we are trying to achieve, and what "done" looks like.
- **State**: branch, what is committed, what is only on disk, what is pushed.
- **What worked**: approaches that are confirmed, each with its evidence (a passing
  command, a test name, a screenshot path).
- **What did not work**: approaches tried and dropped, and why. This section saves the most
  time; do not leave it out.
- **Not tried yet**: ideas worth attempting, most promising first.
- **Next step**: the one concrete action to take first.
- **Watch out for**: traps: a flaky test, a file another process edits, a setting that
  must not change.

Write facts, not narrative. Paths as `path:line`, commands exactly as run.

## Resuming from a note

1. Read the note first, before any other exploration.
2. Check that the state still holds: `git status`, the branch, whether the evidence still
   passes. Things change between sessions.
3. Tell the user in two or three lines where things stand, then take the next step.
4. When the task is finished, say whether the note can be deleted.

## Example

```markdown
# Dark-theme contrast fixes (2026-09-28)

**Goal**: every text pair on rxova.dev passes WCAG AA in dark; done = the audit shows no failures.
**State**: branch `fix/dark-theme`, 2 commits, not pushed.
**What worked**: `--rx-primary` #9d82f6 gives 4.92:1 on tag backgrounds (measured).
**What did not work**: `filter: invert()` on the SVG diagrams; hue shifts the gradient.
**Not tried yet**: dark captures of the DevTools screenshots.
**Next step**: run `pnpm run verify`, then push and open the PR.
**Watch out for**: `check:og` fingerprints tokens.css; regenerate with `pnpm og`.
```

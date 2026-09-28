---
name: rx-parallel
description: Runs several Claude sessions or agents at once without edits colliding, using git worktrees and one owner per area. Use when two or more streams of work can proceed independently, or when a second session is about to edit the same checkout.
---

# rx-parallel

Parallel sessions multiply output only when they do not share files. Give each one its own
working tree, its own area of the code and its own branch, then merge back one at a time.

## When to use

- The slice plan has two or more slices that touch different parts of the code.
- You want research or review running while the main session keeps editing.
- A second session is about to open in the same directory as the first. Stop and read this.

## Steps

1. **Split by area, not by task size.** Write the owners down in `PLAN.md` or `CLAUDE.md`:
   one session per area (for example `app/ui/`, `app/api/`, `db/`). Shared files
   (`package.json`, the lockfile, the schema, global styles) get exactly one owner; others
   ask that owner for changes.
2. **Give each session a worktree.** From the main checkout:

   ```bash
   git fetch origin
   git worktree add ../myapp-api -b feat/api-payments origin/main
   git worktree add ../myapp-ui  -b feat/ui-split-view origin/main
   git worktree list
   ```

   Each worktree needs its own install (`pnpm install` or the repo's equivalent), its own
   `.env.local` copied from the main checkout, and a different dev-server port
   (`PORT=3001 pnpm dev`) if two run at once.

3. **Name the sessions.** Start each one in its worktree directory, and open with a line that
   says who it is: "You are the API session. You own `app/api/` and `lib/payments/`. Do not
   edit files outside them; if you need a change elsewhere, write it in `NEEDS.md`."
4. **Use background subagents for reading, the main session for writing.** Research
   (`rx-researcher`), exploration (`rx-scout`), review (`rx-reviewer`) and security checks
   (`rx-security`) only read, so they can run alongside anything. Edits to one area come from
   that area's session only.
5. **Merge back one at a time.**
   - Each session runs the gate (the `rx-verify` skill) in its worktree and opens its own PR.
   - Merge the first; the others rebase on the new main before merging:
     `git fetch origin && git rebase origin/main`, then run the gate again.
   - Lockfile conflicts: take main's lockfile and reinstall; do not hand-merge it.
6. **Clean up.**

   ```bash
   git worktree remove ../myapp-api
   git branch -d feat/api-payments
   git worktree prune
   ```

## When parallelism hurts

- The work is sequential (the UI needs an API shape nobody has agreed). Agree the contract
  first, in a shared types file owned by one session, then split.
- Two sessions need the same file. Serialize those changes instead.
- A shared migration or schema change is in flight. Land it first, then fan out.
- You cannot review the output as fast as it arrives. More sessions then means more
  unreviewed code, not more progress.
- The machine runs out of memory with several dev servers and test runners.

## Example

Three streams on a receipt-splitting app:

| Session    | Worktree           | Branch               | Owns                                               |
| ---------- | ------------------ | -------------------- | -------------------------------------------------- |
| main       | `~/code/split`     | `main`               | `PLAN.md`, schema, merges                          |
| api        | `~/code/split-api` | `feat/payment-links` | `app/api/`, `lib/payments/`                        |
| ui         | `~/code/split-ui`  | `feat/split-view`    | `app/(app)/split/`, `components/`                  |
| background | none               | none                 | `rx-researcher` on the payment provider's link API |

The UI session codes against `lib/types/payment.ts` (owned by main, agreed first). API merges
first; UI rebases, reruns the gate, merges second.

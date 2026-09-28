---
name: rx-ship
description: Takes a working tree to an opened, verified pull request following the repository's own branch, commit and PR rules. Use when a change is ready to commit, when asked to open a PR, or before pushing to a repository whose conventions you have not checked yet.
---

# rx-ship

Every repository has its own rules for branches, commits and pull requests, and its hooks
enforce them. Read them first, follow them exactly, and check the result as others will see it.

## When to use

- The change is done and verified, and it needs to become commits and a pull request.
- You are asked to "commit this", "push" or "open a PR".
- A commit hook rejected a message and you need to fix it properly.

## Steps

1. **Read the repository's rules.** Look for, in this order:
   - commitlint config: `commitlint.config.*`, `.commitlintrc*`, or a `commitlint` key in
     `package.json`; note `type-enum`, `scope-enum`, `subject-case`, `header-max-length`
     and any body or footer rules;
   - hooks: `.husky/`, `lefthook.yml`, `.pre-commit-config.yaml`;
   - `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, PR templates in `.github/`;
   - a branch-name linter or pattern in CI;
   - practice: `git log --oneline -30` and `git branch -a`.
     The repository's rules win over any habit, including this skill's defaults.
2. **Branch.** Never commit directly to the default branch. Name it `{type}/{topic}`, using a
   type from the repository's allowed list (`feat`, `fix`, `chore`, `docs`, `refactor`,
   ...), unless the repository enforces its own pattern:

   ```bash
   git switch -c feat/payment-links
   ```

3. **Check the author.** `git config user.name` and `git config user.email` should be the
   person the commits belong to; set them per repository if not.
4. **Commit small.** One logical change per commit, staged deliberately (`git add -p` or
   explicit paths; never blindly `git add -A` over unreviewed files). Subject line in the
   repository's format, imperative, within the header length:

   ```bash
   git commit -m "feat(payments): create a payment link per participant"
   ```

   Add a body only when the repository's rules require one or the why is not obvious.

5. **Run the gate** (the `rx-verify` skill) before pushing. Never bypass hooks with
   `--no-verify`; when a hook rejects a commit, read its message and fix the commit.
6. **Push and open the PR.**

   ```bash
   git push -u origin HEAD
   gh pr create --title "feat(payments): payment link per participant" --body-file pr.md
   ```

   Title in the same format as commits if the repository squash-merges. Body:
   - **What**: the change in two or three lines;
   - **Why**: the problem or the slice it completes;
   - **Checks run**: the exact commands and results;
   - **Notes**: screenshots for UI, follow-ups, anything reviewers should look at first.
     Fill in the repository's PR template if it has one.

7. **Re-read the PR as it appears on GitHub.**

   ```bash
   gh pr view --json title,body,author,headRefName,baseRefName
   git log origin/main..HEAD --pretty='%an <%ae> | %s'
   gh pr checks
   ```

   Confirm the title, body, base branch, author and every commit's author are what you
   intended, and that nothing was appended you did not write. Fix with `gh pr edit`, or by
   amending and force-pushing your own branch (`git push --force-with-lease`).

## Example

```text
Rules: commitlint with @commitlint/config-conventional, scope-enum [ui, api, db],
header-max-length 72; husky runs lint-staged and commitlint.
Branch: feat/payment-links
Commits:
  feat(db): add payment_links table
  feat(api): create a payment link per participant
  test(api): cover rounding of per-person totals
Gate: pnpm verify (lint, typecheck, 58 tests, build) passed.
PR #42 opened; gh pr view shows the right title, body and author; checks green.
```

---
name: rx-qa-regression
description: Runs release regression by choosing smoke and regression suites from risk and the change diff, preparing test data and environments, working through a release checklist and recording sign-off, while keeping suites fast. Use before a release or deploy to production, after a large merge, or when the regression suite has grown too slow to run.
---

# rx-qa-regression

Regression testing answers one question: did anything that used to work stop working? Run
everything cheap on every change, and spend the expensive time where the diff and the risk
point.

## When to use

- A release candidate is cut or a production deploy is next.
- A large refactor, dependency upgrade or framework migration has merged.
- The full suite takes so long that people skip it.

## Steps

1. **Read what changed since the last release.**

   ```bash
   git log --oneline v1.4.0..HEAD
   git diff --stat v1.4.0..HEAD
   ```

   Group the changes by area (auth, payments, a screen, a dependency bump). Note shared code
   such as layouts, API clients and migrations: a change there touches everything.

2. **Pick the smoke suite.** A few minutes, the golden paths only: the app loads, login,
   the core action, payment if there is one. It runs on every deploy (the `rx-e2e` skill).
   Tag it so it can run alone:

   ```ts
   test('log in and see the dashboard', { tag: '@smoke' }, async ({ page }) => {
     /* … */
   });
   ```

   ```bash
   pnpm exec playwright test --grep @smoke
   pnpm exec playwright test --only-changed=origin/main   # specs touched by the diff
   pnpm vitest run --changed origin/main                  # unit tests related to the diff
   ```

3. **Pick the regression scope** from the diff and the risk list (the `rx-qa-test-plan`
   skill): all automated tests for changed areas, then manual checks only for what automation
   does not cover, then one short exploratory charter on the riskiest change (the
   `rx-qa-exploratory` skill).
4. **Prepare data and environments.** A staging environment on the release build, migrations
   applied, seed data loaded, one account per role, feature flags set as they will be in
   production. Write the build sha down; test only that build.
5. **Run in order, cheapest first**: type check, lint and unit tests (the `rx-verify` skill),
   then integration, then e2e smoke, then the wider e2e set, then manual checks. Stop and
   report at the first critical failure rather than finishing the list.
6. **Triage every failure.** Real regression: file it (the `rx-qa-bug-report` skill). Flaky
   test: follow the `rx-qa-flaky` skill; do not rerun until green and call it a pass.
   Intended change: update the test in the same PR as the change, not in the release branch.
7. **Sign off** with the checklist filled in and attached to the release.

## Release checklist

```md
## Release <version> · build <sha> · <date>

- [ ] Changes since last release reviewed; risky areas: <list>
- [ ] Unit and integration green on this sha (CI link)
- [ ] E2E smoke green on staging (report link)
- [ ] E2E regression for changed areas green (report link)
- [ ] Manual checks: <list, with who>
- [ ] Exploratory charter on <area>: <outcome>
- [ ] Migrations applied on staging and reversible, or a written roll-forward plan
- [ ] No open critical or high bugs against this release
- [ ] Rollback steps known and tested
      Sign-off: <name, role, date> · Known issues shipped: <links>
```

## Keeping suites fast

- Push checks down: an e2e test that only proves validation belongs in a unit test.
- Create data through the API or database in setup, not by clicking through the UI.
- Log in once and reuse the storage state.
- Run in parallel and shard in CI (`--shard=1/4`); make tests independent so this is safe.
- Delete tests that duplicate each other; track suite time and set a budget for smoke.

## Rules

- Test one build, identified by sha, from start to sign-off. A new commit restarts the run.
- A retry that passes is recorded as flaky, not as a pass.
- Sign-off names a person and lists the known issues shipped, even when the list is empty.

## Example

> Release 1.5.0: 42 commits, including a payments client upgrade and a new settings page.
> Smoke (6 specs, 2 min) green on staging `9f3e1ab`. Regression: all payments unit and API
> tests, `e2e/split.spec.ts`, `e2e/settings.spec.ts`; manual check of receipt emails in two
> clients; 45-minute charter on refunds. One high bug found in refunds, fixed, restarted on
> `c41d7e0`, all green. Signed off by the product owner with one known low issue.

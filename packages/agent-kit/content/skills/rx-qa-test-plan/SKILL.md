---
name: rx-qa-test-plan
description: Writes a risk-based test plan for a feature or release, with scope, risks ranked by impact and likelihood, a test matrix, the split between automated and manual checks, and entry and exit criteria. Use before testing a feature or release starts, when a change is large or risky, or when someone asks how it will be tested.
---

# rx-qa-test-plan

A test plan is a list of decisions about where to spend limited testing time. Rank what
could go wrong, test the worst first, and write down what you chose not to test.

## When to use

- A feature or release is about to be built or tested and nobody has said how.
- The change touches money, auth, data migration, or many screens at once.
- Someone asks "is this ready?" and there is no agreed answer to "ready means what?".

Skip it for a one-line fix; a regression test (the `rx-tdd` skill) is the plan.

## Steps

1. **Read the change, not just the ticket.** The spec or ticket, then the diff or the slice
   plan (`git diff main...HEAD --stat`). List the screens, endpoints, jobs and data it touches,
   and what it deliberately does not change.
2. **Find what already exists.** Test runner, e2e suite, fixtures and seed scripts, CI jobs,
   test environments (`package.json` scripts, `playwright.config.*`, `.github/workflows/`).
   The plan builds on these; it does not invent a new toolchain.
3. **List risks and rank them.** For each, score impact and likelihood from 1 to 3 and
   multiply. Impact: what a user or the business loses. Likelihood: new code, complex logic,
   many integrations, a history of bugs here. Ask about anything you cannot judge.
4. **Pick the matrix from the risks**, not from every combination. Only add a dimension when
   a risk depends on it:
   - browsers and devices (the real traffic share, if analytics exist);
   - roles and permissions (anonymous, member, admin, the owner versus someone else);
   - data states (empty, one, many, very long, invalid, legacy records, after migration);
   - locales, time zones and currencies;
   - network (slow, offline, a failing third party).
5. **Decide automated versus manual.** Automate what must be checked on every change and
   has a stable expected result. Keep manual what needs judgement (layout, copy, feel) or is
   run once. Exploratory sessions (the `rx-qa-exploratory` skill) cover the unknowns.
6. **Write entry and exit criteria.** Entry: what must be true before testing starts. Exit:
   what must be true to ship, stated so anyone can check it.
7. **Save the plan beside the work** (`docs/test-plans/<feature>.md` or the PR description)
   and link it from the ticket. Update it when scope changes.

## Template

```md
# Test plan: <feature or release>

Owner: <name> · Build or branch: <ref> · Target date: <date>

## Scope

In: <screens, endpoints, jobs>
Out (and why): <what is not tested this time>

## Risks

| #   | Risk | Impact (1-3) | Likelihood (1-3) | Score | Covered by |
| --- | ---- | ------------ | ---------------- | ----- | ---------- |

## Matrix

| Dimension | Values | Why it matters here |
| --------- | ------ | ------------------- |

## Coverage

Automated: <unit, integration, e2e specs, with file names>
Manual: <checks and exploratory charters, with who and when>
Not covered (accepted risk): <items>

## Environments and data

<environment URL, seed command, test accounts by role, feature flags>

## Entry criteria

- <for example: builds green on main, seed data loaded, flag on in staging>

## Exit criteria

- <for example: no open critical or high bugs, all score >= 6 risks covered and passing>
```

## Rules

- Every risk scoring 6 or more has a named test or charter; say so explicitly when one does
  not.
- The matrix follows the risks. A 5 x 4 x 3 grid nobody runs is worse than six chosen cells.
- "Out of scope" is a decision with a reason, reviewed by whoever owns the risk.
- Exit criteria are checkable facts, not "quality is good".

## Example

> Risk: split payment rounds per person and loses a cent on uneven totals. Impact 3 (money),
> likelihood 2 (new rounding code). Score 6. Covered by `split.test.ts` (unit, `rx-tdd`) and
> `e2e/split.spec.ts` with 3 people and 10.00 (the `rx-e2e` skill). Matrix: currencies EUR and
> JPY only, because JPY has no minor unit. Manual: one exploratory charter on editing a split
> after payment links are sent. Exit: both specs green in CI and on staging, no open high bugs.

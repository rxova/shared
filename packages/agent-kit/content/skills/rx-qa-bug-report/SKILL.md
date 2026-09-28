---
name: rx-qa-bug-report
description: Writes a bug report someone else can reproduce on the first try, with a minimal repro, expected and actual results, environment, evidence (screenshots, HAR, console, trace), severity and priority, a duplicate check, and a failing test. Use when you find a bug, when a report cannot be reproduced, or before handing a bug to someone else.
---

# rx-qa-bug-report

A good report makes the bug happen on someone else's machine without a conversation. Most
of the work is shrinking the steps until only the ones that matter are left.

## When to use

- You found a bug while testing, exploring or reviewing.
- A report says "it's broken" and you need to turn it into something fixable.
- A bug is about to be handed to another person or agent (such as `rx-debugger`).

## Steps

1. **Check for duplicates first.** Search the tracker for the error text, the screen and
   the key noun (`gh issue list --search "payment link in:title,body" --state all`). If one
   exists, add your evidence and environment to it rather than filing another.
2. **Reproduce it twice** from a clean start: new session, known seed data. Note whether it
   happens every time or only sometimes, and how often (3 of 10).
3. **Make the repro minimal.** Remove each step and see if the bug stays. Replace UI steps
   with one API call where you can:

   ```bash
   curl -i -X POST http://localhost:3000/api/splits \
     -H 'content-type: application/json' -d '{"total":1000,"people":3}'
   ```

4. **Capture evidence** at the moment it fails:
   - a screenshot or short recording with the wrong state visible;
   - the console errors and the failing network request (status, response body);
   - a HAR file (DevTools, or `playwright codegen --save-har=bug.har <url>`), with tokens
     and cookies removed before attaching;
   - a Playwright trace if a test shows it (`--trace on`, then `playwright show-trace`);
   - server log lines with the request id and timestamp.
5. **Write the report** from the template. Title says what is wrong and where, not "bug".
6. **Set severity and priority separately.** Severity is the damage; priority is when it
   gets fixed. The team or product owner owns priority; suggest one.
7. **Turn it into a failing test** when it will be fixed: the smallest test at the lowest
   layer that shows it (unit, then API, then e2e). Mark it as expected to fail only if the
   repository already uses that pattern (`test.fail` in Playwright, `it.fails` in Vitest)
   and link the issue; otherwise keep it on the fix branch. See the `rx-tdd` skill.

## Severity and priority

| Severity | Meaning                                                                          |
| -------- | -------------------------------------------------------------------------------- |
| Critical | Data loss or corruption, security hole, money wrong, core flow down for everyone |
| High     | Core flow broken for some users, or a workaround users will not find             |
| Medium   | Feature wrong with a reasonable workaround, or a minor flow broken               |
| Low      | Cosmetic, copy, rare edge case with no lasting effect                            |

Priority: **P1** fix now or block the release, **P2** this release, **P3** next, **P4** backlog.
A low-severity typo on the pricing page can be P1; a crash in an unused admin tool can be P3.

## Template

```md
**Title**: <what is wrong> on <where> when <condition>

**Environment**: <URL or build sha>, <browser and version>, <OS>, <account role>, <flags>
**Frequency**: always | 3 of 10 | once

**Steps**

1. <smallest set of steps, from a clean start>

**Expected**: <what should happen, and why: spec, previous behaviour, common sense>
**Actual**: <what happens, with exact messages>

**Evidence**: <screenshot, HAR, trace, console, log lines with timestamps>
**Severity**: <level> · **Suggested priority**: <P>
**Notes**: <workaround, first bad version, related issues>
```

## Rules

- One bug per report. Two symptoms with one suspected cause are still two reports, linked.
- Facts in the report, guesses under Notes, labelled as guesses.
- Never attach secrets, real customer data or unredacted auth headers.
- "Cannot reproduce" is closed only after the reporter's environment was tried.

## Example

> **Title**: Edited total not reflected in already-sent payment links. Environment: staging
> `a1b2c3d`, Chrome 140, macOS, member role. Always. Steps: 1. Create a split, 10.00 EUR, 3
> people. 2. Send links. 3. Edit total to 12.00. 4. Open any link. Expected: 4.00. Actual:
> 3.34. Evidence: screenshot, `GET /api/links/…` returns `amount: 334`. Severity high,
> suggested P2. Failing test: `links.test.ts` "recomputes link amounts after total edit".

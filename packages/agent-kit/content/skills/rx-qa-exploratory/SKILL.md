---
name: rx-qa-exploratory
description: Runs session-based exploratory testing with a charter, a time box and heuristics (boundaries, CRUD, interruptions, SFDPOT, tours), driving a real browser and turning each finding into a bug report and a regression test. Use when a feature is new or changed and scripted tests cannot say what is missing, or before a release.
---

# rx-qa-exploratory

Scripted tests confirm what you expected. Exploration finds what nobody expected. It is
still disciplined: a mission, a clock, notes, and a debrief with evidence.

## When to use

- A feature is built and its automated tests pass, but nobody has used it like a user.
- A risk in the test plan (the `rx-qa-test-plan` skill) is marked "exploratory".
- Before a release, on the areas the diff changed most.

## Steps

1. **Write a charter.** One line: _Explore <area> with <resources or technique> to discover
   <kind of problem>_. For example: _Explore the checkout with expired cards and a slow
   network to discover payment errors that leave an order half created._
2. **Set a time box**: 30, 60 or 90 minutes. Stop when it ends, even mid-thought; start a new
   charter for what you found.
3. **Prepare.** The environment URL, test accounts per role, seed data (run the repository's
   seed script), and a way to see the server logs. Open the browser's console and network
   panels, or use browser automation tools if the session has them.
4. **Drive a real browser** and keep a record of what you did:

   ```bash
   pnpm exec playwright codegen http://localhost:3000            # records actions as code
   pnpm exec playwright codegen --save-storage=auth.json <url>  # log in once, reuse it
   pnpm exec playwright open --load-storage=auth.json <url>
   pnpm exec playwright codegen --save-har=session.har <url>    # capture network
   ```

   The generated code is a draft for a regression test later, not a test by itself.

5. **Apply heuristics** to decide what to try next:
   - **Boundaries**: empty, one, maximum, maximum plus one, negative, zero, very long text,
     emoji and right-to-left text, leading and trailing spaces, pasted content.
   - **CRUD**: create, read, update, delete each object; then do it twice, out of order, and
     on something another user just deleted.
   - **Interruptions**: reload mid-flow, back button, double-click submit, two tabs, lose the
     network, session expiry, the laptop sleeping.
   - **SFDPOT**: Structure, Function, Data, Platform, Operations, Time. Walk each letter and
     ask what could vary.
   - **Tours**: the money tour (what the demo sells), the bad-neighbourhood tour (where bugs
     were found before), the back-alley tour (the least used features), the saboteur tour
     (deny permissions, remove data, break dependencies).
6. **Take notes as you go**, timestamped: what you tried, what you saw, questions, and
   anything that looks wrong. Screenshot or record at the moment it happens.
7. **Debrief.** Write the session sheet (below). Each bug becomes a report (the
   `rx-qa-bug-report` skill); each important bug gets a failing test before the fix (the
   `rx-tdd` or `rx-e2e` skill). Areas still untested become new charters.

## Session sheet

```md
## Charter: <one line>

Tester: <name> · Build: <ref or URL> · Time box: 60 min · Actual: 55 min
Split: 70% testing, 20% bug investigation, 10% setup

### Notes

- 10:04 Created split with 3 people, 10.00 EUR, links sent.
- 10:11 Edited total to 12.00 after links sent: old links still show 3.34. Bug?

### Bugs

- B1 (high): edited totals do not update sent payment links. Report: <link>

### Issues and questions

- Is editing after sending meant to be allowed at all?

### Not covered, next charters

- Currency change after sending.
```

## Rules

- One charter per session. If you drift onto something bigger, note it and charter it later.
- Evidence at the moment of the bug: screenshot, console, network entry, time and account.
- Never explore in production with real customer data or real payments.
- Findings are not done until they are a bug report, a question for an owner, or a test.

## Example

> Charter: explore sign-up with odd email addresses to discover validation gaps. 30 minutes.
> Tried `a@b`, uppercase domains, a trailing space, a `+tag` address and 254 characters.
> Found: `Alice@Example.com` and `alice@example.com` create two accounts (high). Filed with
> steps and the network request; the `rx-test-writer` agent added an API test that fails on
> the second sign-up, then the fix normalised case before the uniqueness check.

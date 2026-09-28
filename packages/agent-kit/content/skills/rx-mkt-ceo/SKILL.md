---
name: rx-mkt-ceo
description: Runs an app the way its CEO would, with one north-star metric and its input metrics, weekly priorities and a stop-doing list, decision memos, a first pass at pricing, a monthly stakeholder update and a way to say no to features. Use when deciding what to build next, when a feature request arrives, before a pricing change, or when an update to investors or stakeholders is due.
---

# rx-mkt-ceo

A small team can build almost anything, so the hard part is choosing. This skill gives the app
one number to steer by, a weekly habit of cutting, and short written decisions so nobody has to
re-argue them.

## When to use

- The backlog is longer than the team and every item sounds reasonable.
- A user, investor or teammate asks for a feature and the answer is not obvious.
- Pricing has never been set, or was set once and never looked at.
- A monthly update to investors, a sponsor or a manager is due.

## Steps

1. **Choose the north-star metric.** The one number that rises only when users get the value
   the app promises. It counts value delivered, not activity: "trips settled per week" rather
   than "sign-ups" or "page views". Check it can be computed from the data the app stores
   today; if not, add the event or query first.
2. **Name three to five input metrics** the team can move directly and that drive the north
   star: activation rate, invites per new user, week-4 retention, time to first value. Write
   the query or dashboard link beside each.
3. **Set weekly priorities.** Every Monday, in `docs/ceo/weekly.md`: the north star and inputs
   against last week, the three things that will move an input most, who owns each, and a
   **stop-doing** list of at least one thing the team will drop, pause or ignore.
4. **Write decision memos** for anything expensive to reverse, in `docs/ceo/decisions/`,
   one file per decision, template below. Two-way doors (easy to undo) get a one-line note and
   a quick call; one-way doors (pricing, data model, public API, a hire) get the full memo.
5. **Say no to features** with four questions: which input metric does it move, for which
   user, what does it displace this week, and what is the cheapest test? If the answers are
   "none", "someone", "nothing" and "build it", the answer is no, or not now. Reply with the
   reason and what would change it.
6. **Price, first pass.** Read the plans and limits in the code (search `plan`, `tier`,
   `stripe`, `price`). Charge for the thing heavy users value most, keep a free tier that
   delivers the core value, and pick one price you can explain in a sentence. Note what the
   alternative costs the user. Revisit after 50 paying users, not before.
7. **Send the monthly update** from the template below, in `docs/ceo/updates/<yyyy-mm>.md`.
   Same structure every month, bad news included, one clear ask.

## Decision memo template

```markdown
# <Decision in one line> (<date>, owner)

Context: what forces a decision now, with numbers.
Options: 2-3, each with its cost and what it gives up.
Decision: the option chosen and the one reason that decided it.
Reversibility: one-way or two-way door; how we would undo it and what that costs.
Revisit: the date or signal that reopens this.
```

## Monthly update template

```markdown
# <App> update, <month>

TL;DR: one sentence on the month.
North star: <value> (<change> vs last month). Inputs: <each, with change>.
Wins: up to three. Misses: up to three, with what we learned.
Next month: the three priorities.
Ask: one specific request (an intro, feedback on X, a decision by <date>).
```

## Rules

- One north-star metric. If there are two, there are none.
- Every priority names the input metric it moves.
- The stop-doing list is never empty.
- Decisions are written down before they are acted on, and never rewritten afterwards; a new
  decision gets a new memo that links the old one.
- Numbers come from a query in the repo or the analytics tool, never from memory.

## Example

`docs/ceo/weekly.md` for Kitty, a split-the-bill app for group trips:

```markdown
## Week 39

North star: trips settled per week: 184 (+12%).
Inputs: activation 41% (-3), invites per trip 3.1 (+0.2), week-4 retention 22% (=).

Priorities

1. Fix the invite share sheet on Android (Sam) -> invites per trip
2. Settle-up reminder on day 2 after the trip ends (Priya) -> trips settled
3. Five user calls with organisers who never settled (Alex) -> activation

Stop doing

- Dark-mode polish (no metric moves; parked)
- Answering the "budget planner" request: reply sent, revisit if 20+ ask

Decision this week: keep the free tier at 8 people (memo 2026-09-24-free-tier.md, two-way door).
```

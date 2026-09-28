---
name: rx-mkt-positioning
description: Works out who an app is for, what they use today instead, what only this app can do, the value that unlocks, the category and a one-line pitch, then tests the result with five users. Use before writing landing copy, a launch post or a pitch, or when people keep asking "so what is it?".
---

# rx-mkt-positioning

Positioning is the context that makes a product obvious: who it is for, what it replaces and
why it is better for them. Get it right once and every headline, launch post and pitch gets
easier. Get it wrong and good copy cannot save it.

## When to use

- Before writing a landing page, app-store listing, launch post or pitch.
- The team describes the app differently each time, or people answer the demo with "so it's
  like X?".
- Sign-ups arrive but the wrong people stay, or the right people bounce from the home page.

## Steps

1. **Ground it in what the app does today.** Read the `README`, the routes or screens, the
   onboarding flow and any pricing code. List the capabilities that actually ship. Positioning
   built on the roadmap is a promise, not a position.
2. **Name the competitive alternative.** What would the best-fit user do if the app vanished?
   Usually not a rival app: a spreadsheet, a group chat, a notebook, doing nothing. Write two
   or three, in the user's words.
3. **List unique capabilities.** What the app does that those alternatives do not. Keep only
   the ones a user would notice. "Built with Rust" is not a capability; "works offline" is.
4. **Turn each capability into value.** For each one: "because of this, the user can ...".
   Value is an outcome (time saved, an argument avoided, money recovered), not a feature.
5. **Find who cares most.** The users for whom that value matters a lot, described by a
   situation, not a demographic: "a friend who always ends up paying for the group", not
   "millennials 25 to 34".
6. **Pick the category.** The shelf people will mentally put it on. A known category ("expense
   splitter") explains itself; a new one needs a sentence of explanation every time. Choose a
   known one unless the alternatives truly do not fit.
7. **Write the one-liner.** Template: "`<App>` is a `<category>` for `<who>` that `<value>`,
   unlike `<alternative>`." Then a short version under ten words for a headline.
8. **Fill the canvas** below and save it to `docs/marketing/positioning.md`.
9. **Test with five users.** Five people who fit the target, one at a time, 15 minutes each:
   - show only the one-liner and ask them to say, in their words, what it does and for whom;
   - ask what they use today for this, and what annoys them about it;
   - ask what would make them try it this week.
     Record their exact words. If three of five cannot repeat it back, rewrite and test again.

## Positioning canvas

```markdown
# Positioning: <App> (<date>, v<n>)

| Field                   | Answer |
| ----------------------- | ------ |
| Best-fit user           |        |
| Their situation         |        |
| Competitive alternative |        |
| What annoys them today  |        |
| Unique capabilities     |        |
| Value each one unlocks  |        |
| Category                |        |
| One-liner               |        |
| Headline (< 10 words)   |        |
| Proof we can show       |        |

## Evidence

- Capability -> file or screen that proves it ships
- User test quotes, verbatim, with who said them
```

## Rules

- Every capability in the canvas must point to code or a screen that ships now.
- Use the user's words from the tests, not the team's jargon.
- Positioning for everyone is positioning for no one; narrow until it feels uncomfortable.
- Do not name a competitor as worse in public copy; name the alternative's pain instead.
- Revisit it after a launch or when the best-fit user changes; bump the version in the file.

## Example

`docs/marketing/positioning.md` for Kitty, a split-the-bill app for group trips:

```markdown
# Positioning: Kitty (2026-09-28, v2)

| Field                   | Answer                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Best-fit user           | The friend who books and pays for things on a group trip                                                                                 |
| Their situation         | 4-8 people, a week away, dozens of shared costs in 3 currencies                                                                          |
| Competitive alternative | A shared spreadsheet, the group chat, "I'll sort it out later"                                                                           |
| What annoys them today  | Chasing people for money after the trip; awkward reminders                                                                               |
| Unique capabilities     | Snap a receipt to add it; per-person currency; one-tap settle-up                                                                         |
| Value each one unlocks  | Costs logged in the moment; nobody does FX maths; paid back in a day                                                                     |
| Category                | Group expense splitter                                                                                                                   |
| One-liner               | Kitty is a group expense splitter for trips that gets the organiser paid back the day you get home, unlike a spreadsheet nobody updates. |
| Headline (< 10 words)   | Get paid back before the tan fades.                                                                                                      |
| Proof we can show       | Demo: receipt photo to settle-up links in 20 seconds                                                                                     |

## Evidence

- Receipt capture -> app/expenses/new/page.tsx, lib/ocr.ts
- Currency per person -> lib/money/convert.ts
- "The spreadsheet always dies on day two." (Priya, organised a Lisbon trip)
- 4 of 5 repeated the one-liner correctly; 1 thought it was a travel booking app (v1 said "trip app")
```

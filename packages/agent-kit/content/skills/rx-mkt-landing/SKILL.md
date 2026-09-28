---
name: rx-mkt-landing
description: Writes landing page and app-store listing copy (hero headline and subhead, the problem, three benefits tied to real features, social proof, one call to action, FAQ answers to objections, meta and Open Graph text) into the file the site renders, and sets up conversion measurement. Use when a product needs a home page, a store listing or a rewrite of copy that is not converting.
---

# rx-mkt-landing

A landing page has one job: get the right visitor to take one action. Every section either
moves them towards it or answers a reason not to. Write it from the positioning, put it where
the site reads it, and measure whether it works.

## When to use

- The app needs a home page, a waitlist page or an App Store or Google Play listing.
- The current page lists features but visitors do not sign up.
- Positioning has changed (the `rx-mkt-positioning` skill) and the copy has not.

## Steps

1. **Start from positioning.** Read `docs/marketing/positioning.md` if it exists; if not, run
   the `rx-mkt-positioning` skill first or write a one-line assumed version and label it.
2. **Find where copy lives.** Look for the home route (`app/page.tsx`, `src/pages/index.*`,
   `index.html`), a content file (`content/*.md`, `messages/en.json`, `site.config.ts`) and
   the head or metadata export. Write copy into that file, or into
   `docs/marketing/landing.md` if the page does not exist yet, and say which.
3. **Hero.** Headline under ten words, saying the outcome for the best-fit user. Subhead of one
   or two sentences saying how and for whom. One CTA button whose label is a verb plus the
   thing ("Start a trip", not "Get started"). A screenshot or short loop of the real product.
4. **The problem.** Two or three sentences in the user's words, taken from user tests or
   support messages. The reader should nod, not learn.
5. **Three benefits.** Each a short heading (the outcome), one sentence of how, and the
   feature that delivers it with a screenshot. Check each feature exists in the code.
6. **Social proof.** Real quotes with name and context, usage numbers you can show from data,
   or logos with permission. If you have none yet, leave the section out; never invent it.
7. **Objections as FAQ.** Four to six questions a doubter asks: price, privacy, "do my friends
   need the app too?", platform support, cancelling. Answer each in two sentences, honestly.
8. **Closing CTA.** Repeat the same action with the same label. One action per page.
9. **Meta and sharing.** Title under 60 characters, description under 155, Open Graph title,
   description and a 1200x630 image. Set them in the framework's metadata API.
10. **Store listing** (if mobile): app name (30 chars), subtitle (30), promotional text (170),
    description opening with the hero lines, keywords field (100 chars, comma separated, no
    repeats of the name), and five screenshots each with a one-line caption telling the story.
11. **Measure.** Fire one event per step: `landing_viewed`, `cta_clicked`, `signup_started`,
    `signup_completed`, using the analytics already in the repo (search for `track(`,
    `posthog`, `plausible`, `gtag`). Conversion is `signup_completed / landing_viewed`. Change
    one section at a time and compare a week against the week before.

## Rules

- One CTA, one label, everywhere on the page.
- Every benefit maps to a feature in the code; every number maps to a query you can rerun.
- Outcomes before features; the user's words before the team's.
- No "revolutionary", "seamless", "AI-powered" unless the reader cares; say what it does.
- Keep claims you cannot back out of the copy and list them for the team to verify.

## Example

`docs/marketing/landing.md` for Kitty, a split-the-bill app for group trips:

```markdown
# Hero

Get paid back before the tan fades.
Kitty logs shared trip costs as they happen and tells everyone what they owe, in their own
currency. [Start a trip]

# Problem

Someone always pays for the villa. Then the spreadsheet dies on day two and you spend a week
after the trip chasing people for money.

# Benefits

- **Log it in the moment.** Snap the receipt; Kitty reads the total. (receipt capture)
- **No currency maths.** Everyone sees their share in their own currency. (per-person currency)
- **Settled in a tap.** One link per person to pay you back. (settle-up links)

# FAQ

- Is it free? Free for trips up to 8 people. Kitty Plus (larger groups, exports) is 3 EUR a month.
- Do my friends need the app? No. They can join and pay from a link in the browser.
- Do you hold our money? No. Payments go straight between you through your usual app.

# Meta

Title: Kitty - split trip costs with friends
Description: Log shared costs as you travel and get paid back the day you get home. Free for groups up to 8.
OG image: public/og.png (hero screenshot, 1200x630)

# Unverified

- "Free up to 8": pricing code says 6 (lib/billing/plans.ts). Confirm before publishing.
```

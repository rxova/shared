---
name: rx-mkt-launch
description: Plans a product launch with a target audience, channels (Product Hunt, Show HN, Reddit communities and their rules, newsletters, social, the waitlist email), an assets checklist, a day-of timeline, sign-up funnel events and what to measure afterwards. Use when an app is about to go public, or when a launch is on the calendar and nobody owns the plan.
---

# rx-mkt-launch

A launch is a day of borrowed attention. It pays off when the right people see it, the product
holds up when they arrive, and you can tell afterwards which channel brought who. Plan all
three before the day.

## When to use

- The app is going public, leaving beta or opening its waitlist.
- A launch date is set but there is no plan, no assets and no tracking.
- A previous launch brought traffic and nobody could say what it was worth.

## Steps

1. **Pick the audience and the goal.** One best-fit user (from `docs/marketing/positioning.md`)
   and one number: sign-ups, activated users or paying users. Traffic is not a goal.
2. **Choose channels where that audience already is**, three at most, and read each one's rules:
   - **Product Hunt**: launch at 00:01 Pacific; the maker posts the first comment with the
     story; no asking for upvotes; a gallery of 3 to 5 images and a short video.
   - **Hacker News, Show HN**: only for something people can try now, without a sign-up wall
     if possible; title `Show HN: <App> - <what it does>`; a plain first comment on how and
     why it was built; answer every question, never argue.
   - **Reddit**: read each community's sidebar and pinned posts; many ban self-promotion or
     allow it one day a week. Post as a person with history, lead with the problem, disclose
     that you built it.
   - **Newsletters and communities**: pitch editors a week ahead with a two-line summary and
     a link that works.
   - **Social**: a short thread or video showing the product doing the one thing.
   - **Email to the waitlist**: the warmest channel; send first, with a direct link to start.
3. **Instrument the funnel before the day.** Use the analytics already in the repo (search for
   `track(`, `posthog`, `plausible`, `gtag`, `mixpanel`). Events: `landing_viewed`,
   `signup_started`, `signup_completed`, `activated` (the first real use, for example
   `trip_created` with a second member). Capture `utm_source` and `ref` on the first visit and
   attach them to `signup_completed`. Give each channel its own tagged link.
4. **Prepare assets.** Checklist below; write drafts to `docs/marketing/launch.md`.
5. **Load-check the product.** The landing page, sign-up and golden path on the production URL,
   rate limits and free-tier quotas on your hosts and APIs, and an error alert that reaches a
   person. The `rx-security-sweep` skill before any public link.
6. **Run the day** to the timeline below. One person watches comments, one watches the app.
7. **Measure after** at 24 hours and 7 days: sign-ups and activation by channel, the drop-off
   step in the funnel, and the questions people asked most. Write a short retro in the same
   file: what to repeat, what to skip, what to fix in the product.

## Assets checklist

- [ ] One-liner and 60-word description
- [ ] Landing page live with the launch CTA (the `rx-mkt-landing` skill)
- [ ] 3 to 5 screenshots at 1270x760, a 30 to 60 second video, an OG image
- [ ] Maker comment, Show HN comment, Reddit post drafted per community
- [ ] Waitlist email and a thank-you email for new sign-ups
- [ ] Tagged links per channel
- [ ] FAQ answers for pricing, privacy and "why not use X"

## Day-of timeline

| Time (local) | Action                                                          |
| ------------ | --------------------------------------------------------------- |
| T-1 day      | Final click-through on production; seed a demo account          |
| 08:00        | Waitlist email; Product Hunt post live (00:01 PT if US-focused) |
| 09:00        | Show HN post; social thread                                     |
| 09:00-18:00  | Reply to every comment within 30 minutes                        |
| 12:00        | Funnel check; fix the worst drop-off if it is a bug             |
| 18:00        | Thank-you post; note numbers for the retro                      |

## Rules

- Never ask for upvotes or use voting rings; every platform penalises it.
- Disclose that you are the maker, every time.
- No launch without funnel events and tagged links in place.
- Do not launch on a day nobody can watch the app.

## Example

Extract from `docs/marketing/launch.md` for Kitty, a split-the-bill app for group trips:

```markdown
Goal: 300 activated users (trip with 2+ members) in 7 days.
Audience: friends who organise group trips.
Channels: waitlist (1,140 emails), Product Hunt, Show HN. Reddit: the big travel community
bans self-promotion outside its weekly thread, so post there on Saturday only.

Show HN: Kitty - split group trip costs, each person in their own currency
First comment: why we built it (a Lisbon trip, a dead spreadsheet), how currency conversion
works, what is free, what we want feedback on.

Links: ?utm_source=producthunt, ?utm_source=hn, ?utm_source=waitlist

Retro (day 7): 412 activated. Waitlist 51%, HN 30%, PH 14%. Drop-off at "invite friends":
the share sheet failed on Android Firefox. Fix first.
```

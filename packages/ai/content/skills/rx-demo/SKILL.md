---
name: rx-demo
description: Prepares a live demo that cannot fail, with seeded data, a written click path, fallbacks and a backup video. Use in the last hours before a demo, pitch or judging round, or after the feature freeze.
---

# rx-demo

Demos fail on the things nobody rehearsed: an empty database, an expired login, a slow API,
a projector that cuts off the right side. Rehearse all of them before anyone is watching.

## When to use

- The feature freeze has started and the demo is within a few hours.
- The demo depends on data, a login, an external API or the venue's network.
- A teammate who did not build the app is going to present it.

## Steps

1. **Seed data and one reset command.** Write a script that wipes demo data and inserts a
   known, realistic set: names, amounts and images that tell the story. Wire it to one
   command (`pnpm db:reset-demo` or similar) that is safe to run twice. Run it before every
   rehearsal and just before going on stage.
2. **Write the demo path click by click** in `DEMO.md`: each step, what to click or type,
   what the audience should see, and what to say. Paste-ready inputs go in the file too.
3. **Prepare the account.** A dedicated demo user, already logged in on the demo browser
   profile, with a session that will not expire before the slot. Keep the password in the
   team's password manager, not on a slide.
4. **Remove flaky dependencies from the path.**
   - Slow or rate-limited API (LLMs, OCR, payments): cache the demo inputs' responses or add
     a fallback that returns a recorded response when the call fails or takes over a few
     seconds. Behind an explicit flag (`DEMO_MODE=1`), never silently in production code.
   - Email or SMS steps: show the result in the app instead of waiting for a real message.
   - Anything needing the venue Wi-Fi: have a phone hotspot ready.
5. **Record a backup video** of the full path at the final build: screen recording, 1080p,
   under the time limit, saved locally and uploaded. If the live demo breaks, switch to it
   without apology.
6. **Test on the real screen.** Set the browser to the projector resolution (often 1920x1080
   or 1280x720) at 100% zoom, then bump zoom so the back row can read it. Check mobile if
   the demo uses a phone. Turn off notifications, hide bookmarks, close other tabs.
7. **Two ways to run it.** The deployed URL as primary; a local build (`pnpm build && pnpm
start`, not the dev server) with local data as fallback. Both opened in tabs in advance.
8. **Rehearse** twice with a timer, once by someone who did not build it. Fix what they
   stumble on, in copy and layout rather than in explanations.

The `rx-e2e` skill can turn `DEMO.md` into an automated smoke test; the `rx-pitch` agent
can shape the story around it.

## 5-minute pre-demo checklist

- [ ] `pnpm db:reset-demo` run; first screen shows the expected data
- [ ] Demo user logged in; session still valid
- [ ] Deployed URL loads; local fallback running in another tab
- [ ] `DEMO_MODE` fallbacks on if the network looks weak
- [ ] Backup video open in a player, paused on frame one
- [ ] Laptop charged or plugged in; do-not-disturb on; screen sleep off
- [ ] Display mirrored, resolution checked, zoom set
- [ ] `DEMO.md` open on the presenter's phone

## Example

`DEMO.md` for a receipt splitter:

```markdown
Reset: pnpm db:reset-demo User: demo@team.test (logged in, Chrome profile "Demo")

1. Home shows "Friday dinner" draft. Say: "Four friends, one receipt."
2. Click "Upload receipt", choose ~/demo/receipt.jpg. Items appear in about 2 s
   (DEMO_MODE returns the cached OCR if it takes over 5 s).
3. Drag "Pad thai" to Alex, "Beer x2" to Sam. Totals update live.
4. Click "Send links". Three links appear with amounts. Say: "Everyone pays their share."
5. Open Sam's link on the phone. Paid state shows on the laptop. End.
   Backup video: ~/demo/backup.mp4 (2:40)
```

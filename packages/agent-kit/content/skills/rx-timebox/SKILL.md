---
name: rx-timebox
description: Runs a time-boxed build with checkpoints, a must/should/could/won't list and a hard freeze, so main is always demoable. Use during a hackathon or any fixed-deadline build, and whenever someone asks "should we still add this?".
---

# rx-timebox

A deadline does not move, so scope has to. This skill keeps the scope honest at regular
intervals and protects the last hours for making the demo solid.

## When to use

- The build has a fixed end time (hackathon, demo day, a customer call).
- A checkpoint is due, or nobody has looked at the plan for a few hours.
- Someone wants to start a new feature and you are not sure there is time.

## Steps

1. **Set the clock.** Write in the README or team chat:
   - end time, and the freeze time (for a 24h build, about 4h before the end; for 48h,
     about 6h);
   - checkpoints every 2 to 3 hours, with a named person running each.
2. **Write the MoSCoW list** in `PLAN.md`:
   - **Must**: the golden path, end to end, on the deployed URL. Nothing else.
   - **Should**: what makes the demo convincing (real data, one error state, a nice empty state).
   - **Could**: extras, only if a Must is done and green.
   - **Won't**: said out loud, so nobody quietly builds it.
3. **Keep main demoable.** Every merge to main must build and deploy. Work on branches, merge
   small slices (the `rx-slice` skill), run the gate before merging (the `rx-verify` skill).
   If main breaks, fixing it beats everything else.
4. **Run each checkpoint** (10 minutes, standing):
   - What merged since last time? Open the deployed URL and click the golden path.
   - What is blocked? Who helps?
   - Re-estimate each open item. Anything not on track moves down a tier.
   - Update `PLAN.md` and the time of the next checkpoint.
5. **Cut features on these signals:**
   - it has taken twice its estimate and is not close;
   - it needs a new dependency, service or credential you do not have yet;
   - it is not on the golden path and a Must is still open;
   - nobody can say what the demo loses without it.
     Cutting means: revert or hide behind a flag, move it to Won't, tell the team.
6. **Freeze.** After the freeze time only three kinds of change go in: bug fixes on the
   golden path, demo polish (copy, spacing, seed data), and the pitch. No new features, no
   dependency upgrades, no refactors, no schema changes.

## The 2-hours-left checklist

- [ ] Main is green and deployed; note the exact commit that is "the demo build"
- [ ] Golden path clicked through on the deployed URL by someone who did not build it
- [ ] Seed data reset and verified (the `rx-demo` skill)
- [ ] Backup video recorded
- [ ] Unfinished branches left unmerged, not half-merged
- [ ] Debug logs, test banners and `TODO` text removed from anything visible
- [ ] Secrets checked (the `rx-security-sweep` skill)
- [ ] Pitch and slides drafted (the `rx-pitch` agent), submission form fields drafted
- [ ] Everyone knows who presents, who drives the laptop, who watches the clock

## Example

`PLAN.md` at the 18-hour checkpoint of a 24-hour build:

```markdown
End: Sun 12:00. Freeze: Sun 08:00. Next checkpoint: Sun 02:00 (Sam).

## Must

- [x] Upload receipt photo -> parsed line items
- [x] Tag items per person
- [ ] Payment link per person (Alex, 60% done, on track)

## Should

- [ ] Friendly error when OCR fails (moved up: seen twice in testing)
- [ ] Seeded demo receipt

## Could

- Tip splitting (cut at 16h checkpoint: over estimate, not on golden path)

## Won't

Multi-currency, history page, dark mode.
```

---
name: rx-slice
description: Breaks a feature into thin end-to-end slices and builds them one at a time, each reviewed and merged on its own. Use when a request is bigger than one focused change, such as a new app, a new service or a feature spanning several layers.
---

# rx-slice

Large changes fail late and review badly. Build the thinnest thing that runs from end to end,
then widen it, one slice at a time.

## When to use

- The work spans layers (storage, API, UI) or several independent parts.
- You cannot describe the whole change in a pull-request title.
- The user asks for an app, service or "the whole feature".

## Steps

1. **Pin down the outcome.** Who uses it, what they can do afterwards that they cannot do
   now, and what is out of scope. Where you lack the answer, write `open question` and ask;
   do not invent requirements.
2. **Cut slices.** Each slice:
   - runs from input to output (a request that reaches storage and comes back, a screen that
     loads real data), even if narrow;
   - leaves the project working and releasable;
   - fits in one reviewable pull request;
   - has its acceptance checks written down before it is built.

   Order the slices so the riskiest assumption is tested earliest.

3. **Stop and confirm.** Show the slice list with its checks and wait for a go-ahead before
   writing code. The slice plan is where changing course is cheap.
4. **Build one slice.** Tests first where the behaviour is clear. Then run the repository's
   full gate (the `rx-verify` skill) and have the change reviewed (the `rx-reviewer` agent).
5. **Ship it.** One branch and one pull request per slice, following the repository's branch
   and commit conventions. Merge before starting the next slice, unless the user says to
   stack them.
6. **Re-plan as you learn.** When a slice shows the plan is wrong, update the remaining
   slices and say what changed.

## Example

A feature-flag service, sliced:

1. Create and read a flag over the API, stored in the database; one on/off flag, no UI.
2. Evaluate a flag for a user in the server SDK, with a local cache and a default when the
   service is unreachable.
3. Percentage rollouts: stable per user, widened without reshuffling users already in.
4. An audit log of every change: who, when, before and after.
5. The admin UI on top of the existing API.

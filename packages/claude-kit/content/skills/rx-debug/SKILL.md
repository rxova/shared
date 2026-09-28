---
name: rx-debug
description: Finds and fixes the root cause of a bug by reproducing it, testing one hypothesis at a time and bisecting. Use when something fails and the cause is not obvious within a few minutes, when it works locally but not deployed, or when a fix did not stick.
---

# rx-debug

Guessing feels fast and is slow. Make the bug happen on demand, read what it actually says,
then narrow it down until only one cause is left.

## When to use

- An error, crash or wrong result whose cause you cannot name yet.
- "Works on my machine" or "works locally, broken in production".
- A fix that did not hold, or a bug that comes and goes.

## Steps

1. **Reproduce reliably.** Write the exact steps, input and environment that trigger it.
   Shrink it to the smallest case: one request with `curl`, one test, one page. If it is
   intermittent, find what makes it more likely (load, timing, a specific record).
2. **Read the actual error.** The full message and stack trace, server logs as well as the
   browser console, and the network tab (status code, response body). Find the first frame
   in your own code. Most bugs are explained here and never need step 3.
3. **One hypothesis at a time.** Write it down: "the token is expired because the clock on
   the server is UTC". Predict what you would see if it were true, then check only that.
   Change one thing per experiment and undo it if it did not help.
4. **Bisect when you cannot see it.**
   - In history: `git bisect start`, `git bisect bad`, `git bisect good <sha>`, test, mark,
     repeat; `git bisect run pnpm test -- split` automates it; finish with `git bisect reset`.
   - In code: comment out or short-circuit half the path; see which half keeps the bug.
   - In data: halve the input file or record set until one record triggers it.
5. **Log deliberately.** Add a few logs at the boundaries you are unsure about, with a
   prefix you can grep (`[dbg-split]`), printing values and types, not "here".
6. **Compare environments** when behaviour differs between places:
   - environment variables present and spelled the same (print the keys, never the values);
   - runtime and dependency versions (`node -v`, lockfile committed and used);
   - caches: build output, `.next`, service worker, CDN, browser;
   - ports, base URLs, and which database the app is really connected to;
   - time zone and locale.
7. **Fix the root cause**, not the symptom. If a `try/catch`, a retry or a null check makes
   the error vanish, ask why the value was wrong in the first place.
8. **Add a regression test** that failed before the fix and passes after it (the `rx-tdd`
   skill).
9. **Remove the noise.** `grep -rn "dbg-" .` and delete every temporary log, then run the
   gate (the `rx-verify` skill).

Stuck after an hour: write down what you ruled out and why (the `rx-handoff` format works),
then hand it to the `rx-debugger` agent or a teammate with fresh eyes.

## Common hackathon culprits

- **CORS**: the browser blocks it, the server logs nothing. Check the response headers and
  the preflight `OPTIONS` request.
- **Env vars missing in deploy**: set locally in `.env.local`, never added on the host; or
  a client-side variable without the framework's public prefix.
- **Stale build cache**: delete build output and rebuild; redeploy without the cache.
- **Wrong port or base URL**: the frontend still calls `localhost:3000` in production.
- **Auth cookie domain**: cookies set for one domain, `SameSite` or `Secure` blocking them
  on another, or on plain `http`.
- **Timezone**: the server runs in UTC, the laptop does not; "today" differs by a day.

## Example

> Bug: payment links 500 in production, fine locally. Error in host logs:
> `TypeError: Cannot read properties of undefined (reading 'create')`, first own frame
> `lib/payments/client.ts:12`. Hypothesis: the API key is missing, so the client is never
> built. Printed env keys in a one-off log: `PAYMENTS_KEY` absent on the host. Added it,
> redeployed, fixed. Regression: the client now throws a clear error at startup when the
> key is missing, with a test for it. Debug log removed; `pnpm verify` passed.

---
name: rx-qa-flaky
description: Triages a flaky test by reproducing it with repeat and shuffled runs, classifying the cause (timing, order dependence, shared state, network, time zones, animation), fixing it at the root and proving stability, with a quarantine policy that has an owner and a deadline. Use when a test passes and fails without a code change, or when CI is being rerun until green.
---

# rx-qa-flaky

A flaky test is a bug in the test or in the code, and you do not yet know which. Retries and
sleeps hide it; they do not fix it. Make it fail on demand, then remove the cause.

## When to use

- A test fails in CI and passes on rerun, or fails only on some machines.
- A test passes alone but fails in the full suite, or the reverse.
- The team has started rerunning pipelines instead of reading failures.

## Steps

1. **Collect the evidence.** CI history for the test (how often, which jobs, which OS and
   shard), the failure message, and any trace, screenshot or log. Different messages across
   failures point at different causes.
2. **Reproduce with repetition**, retries off:

   ```bash
   pnpm exec playwright test e2e/split.spec.ts --repeat-each=50 --retries=0 --workers=4
   pnpm vitest run lib/split --sequence.shuffle            # random order; seed is printed
   pnpm vitest run --sequence.shuffle --sequence.seed=1234 # replay that order
   npx jest --randomize --seed=1234
   pytest tests/test_split.py --count=50    # pytest-repeat; pytest-randomly shuffles
   for i in $(seq 50); do pnpm vitest run lib/split || break; done
   ```

   Also try: the full suite versus the test alone, more workers, CPU throttling, and the CI
   time zone (`TZ=UTC`, `TZ=Pacific/Auckland`).

3. **Classify the cause:**
   - **Timing**: asserting before the UI or a promise settles; fixed waits
     (`waitForTimeout`, `sleep`); racing two requests. Fix: wait on the condition
     (`await expect(locator).toHaveText(...)`, `waitForResponse`, `vi.waitFor`).
   - **Order dependence**: a test relies on data or state another test created. Fix: each
     test creates what it needs and cleans up; reset modules and mocks between tests.
   - **Shared state**: the same database rows, user, file or port across parallel workers;
     global singletons, caches, un-restored `vi.spyOn`. Fix: unique data per test (suffix
     with the worker index or a random id), isolated storage, restore in `afterEach`.
   - **Network**: a real third-party or staging API. Fix: stub at the boundary
     (`page.route`, MSW) and keep one contract test against the real thing.
   - **Time and locale**: "today", month ends, DST, `toLocaleString`. Fix: fake the clock
     (`vi.useFakeTimers`, `page.clock.setFixedTime`) and fix `TZ` and locale in config.
   - **Animation and rendering**: clicking an element mid-transition, screenshots mid-fade.
     Fix: `reducedMotion: 'reduce'` in the context, `animations: 'disabled'` for screenshots,
     assert the final state.
   - **Randomness and ordering**: unsorted query results, random ids, `Set` order. Fix: sort
     or seed.
   - **Real product bug**: a race in the code itself. Fix the code (the `rx-debug` skill).
4. **Fix the root cause**, then prove it: the same repeat command, at least 50 runs, zero
   failures, and the full suite shuffled once.
5. **Quarantine only if it cannot be fixed today.** Mark it with the repository's pattern
   (`test.fixme`, a `@quarantine` tag excluded from the blocking job), open an issue with an
   owner and a deadline of at most two weeks, and keep running it in a non-blocking job.

## Rules

- Never add retries, longer timeouts or sleeps as the fix. CI-level retries may exist for
  reporting; a test that needed one is recorded as flaky.
- Never delete or skip a flaky test without an issue, an owner and a deadline.
- A quarantined test past its deadline is fixed or deleted with the owner's agreement, and the
  coverage it gave is replaced.
- The fix lands with the evidence: the repeat command and its result in the PR description.

## Example

> `settings.spec.ts` "saves display name" failed 4 of 50 with `--repeat-each=50 --workers=4`,
> never alone. The failure showed another test's name in the field. Cause: every test
> logged in as the same seeded user and renamed it in parallel (shared state). Fix: create a
> user per test through the API in a fixture. 200 runs, 0 failures; PR notes the command.
> The `rx-qa-flake-hunter` agent can run this loop end to end.

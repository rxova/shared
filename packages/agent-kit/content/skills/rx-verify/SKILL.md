---
name: rx-verify
description: Proves a change works with the repository's own checks before it is called done. Use before saying a task is finished, before committing, and before opening a pull request.
---

# rx-verify

"Done" is a claim, and this skill is how you back it. The checks are the repository's, not
yours: run what CI will run, in the order it runs it.

## When to use

- You are about to say a change is complete, fixed or working.
- You are about to commit, push or open a pull request.
- You changed something shared (a config, a type, a public function) and cannot see every
  caller.

## Steps

1. **Find the gate.** In this order, take the first that exists:
   - a single script meant for it: `verify`, `check`, `ci`, `validate` in `package.json`
     (or a `Makefile`, `justfile`, `Taskfile`);
   - the commands the CI workflow runs (`.github/workflows/*.yml`);
   - what `AGENTS.md`, `CLAUDE.md` or `CONTRIBUTING.md` say to run;
   - otherwise the individual scripts that exist: build, typecheck, lint, format check, test.
2. **Run it for real.** Use the repository's package manager (the lockfile says which). Do
   not skip a step because it is slow; if it is very slow, run it in the background and wait.
3. **Read the output, not the exit code alone.** Skipped tests, "no tests found", and
   warnings promoted to errors in CI all count.
4. **When something fails**, fix the cause, then run the whole gate again, not only the
   step that failed. Never weaken the check itself: no disabled rules, lowered thresholds,
   `.skip`, or `--no-verify`.
5. **Report** what you ran and what it said.

## Reporting

- Passed: name the commands and give the headline numbers ("lint, typecheck, 214 tests,
  build: all passed").
- Failed and not fixed: say so first, quote the failing lines, and say what you think the
  cause is.
- Could not run (missing service, credentials, platform): say which step and why, and do not
  describe the change as verified.

## Example

> Ran `pnpm run verify`: lint, format, build, typecheck, 163 tests (coverage 95%+ per file),
> exports and pack smoke all passed. The only warning is an existing one in `site/Reveal.astro`.

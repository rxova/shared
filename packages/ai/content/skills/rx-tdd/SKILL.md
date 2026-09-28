---
name: rx-tdd
description: Applies red, green, refactor at hackathon speed, testing first where logic is easy to get wrong and skipping it where code is throwaway. Use when writing parsers, calculations, state logic or anything involving money or time, or when a bug keeps coming back.
---

# rx-tdd

Tests first are not a ritual; they are the fastest way to get tricky logic right. Use them
where a mistake is silent and expensive, and skip them where the screen itself is the test.

## When to use

Test first:

- parsers and formatters (CSV, dates, OCR output, LLM responses into JSON);
- money, tax, splitting, rounding, currencies;
- time: time zones, durations, "today", recurring schedules;
- permission and state logic (who can do what, what state follows which);
- a bug you have already fixed once.

Do not test first:

- throwaway UI, layouts, copy, styling;
- glue code that only passes data through;
- a spike to learn how an API behaves. Spike, learn, delete, then test the real code.

## Steps

1. **Find the test setup.** Check `package.json` scripts and the lockfile for the runner
   (Vitest, Jest, `node --test`, pytest, `go test`); follow the existing file naming and
   location. If there is none, ask before adding one, and prefer what the framework suggests.
2. **Red: write one failing test.** One behaviour, named as a sentence, with concrete inputs
   and the exact expected output. Include the edge case you are worried about.
3. **Run it and watch it fail for the right reason.** An import error or a typo is not red.
   The failure message should describe the missing behaviour.
4. **Green: write the smallest code that passes.** Hard-code if that is honestly the smallest
   step; the next test will force the general version. Do not add behaviour no test asks for.
5. **Refactor under green.** Rename, extract, remove duplication, with tests passing after
   each change. If a test goes red during refactoring, undo the last step.
6. **Repeat** with the next case: empty input, zero, negative, boundary, the odd real example.
7. **Run only the affected tests while iterating**, then the full suite before you commit:

   ```bash
   pnpm vitest run lib/split           # one folder
   pnpm vitest -t "rounds remainders"  # one test by name
   npx jest lib/split --watch
   pytest tests/test_split.py -k remainder
   go test ./split -run TestRemainder
   ```

   Then the full gate (the `rx-verify` skill).

8. **Hand off larger batches.** The `rx-test-writer` agent can widen coverage once the core
   cases are in place.

## Rules

- Never change a test to make it pass unless the test itself was wrong; say so when it was.
- No `.only` or `.skip` left behind.
- Keep tests fast and offline: fake the clock, the network and randomness.

## Example

Splitting a bill in integer cents, test first:

```ts
import { describe, it, expect } from 'vitest';
import { splitCents } from './split';

describe('splitCents', () => {
  it('splits evenly when it divides', () => {
    expect(splitCents(900, 3)).toEqual([300, 300, 300]);
  });

  it('gives remainder cents to the first people, never loses a cent', () => {
    const parts = splitCents(1000, 3);
    expect(parts).toEqual([334, 333, 333]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);
  });

  it('rejects zero people', () => {
    expect(() => splitCents(1000, 0)).toThrow(/at least one/);
  });
});
```

Red (module missing), then green with a `Math.floor` plus remainder loop, then refactor the
remainder logic into a named helper with all three tests still passing.

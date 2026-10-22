/**
 * A mulberry32 generator seeded with `seed`: a function returning the next
 * number in `[0, 1)`, the same sequence every time for the same seed.
 *
 * For orders that have to come back — a shuffled quiz a reload must not
 * reshuffle — store the seed, not the order. Use `hashString` to get one from
 * text, and `randomBelow` or `crypto.getRandomValues` to pick a fresh one.
 *
 * **Not for anything that must be unpredictable.** Its state is 32 bits and
 * its output gives the state away; `randomBelow` is the draw for ids, tokens
 * and anything an adversary should not be able to replay.
 *
 * **The sequence is part of this package's API.** Seeds get stored, so the
 * same seed will keep producing the same numbers across minor releases.
 */
export const seededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let drawn = Math.imul(state ^ (state >>> 15), 1 | state);
    drawn = (drawn + Math.imul(drawn ^ (drawn >>> 7), 61 | drawn)) ^ drawn;
    return ((drawn ^ (drawn >>> 14)) >>> 0) / 4294967296;
  };
};

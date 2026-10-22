import { randomBelow } from "@/random/random-below";
import type { Below } from "@/random/shuffle.types";

/**
 * A new array holding `items` in a random order, by Fisher-Yates: each
 * position from the end down is swapped with one drawn from the positions at
 * or before it, which is the only loop that gives every permutation the same
 * chance. The input is not touched.
 *
 * `below` is the draw, `randomBelow` by default. Pass `seededRandom(seed)`'s
 * draw for an order that comes back the same after a reload, or a fake in a
 * test. A draw that returns something outside `[0, bound)` would silently bias
 * the result, so it is clamped rather than trusted.
 */
export const shuffle = <Item>(items: readonly Item[], below: Below = randomBelow): Item[] => {
  const out = [...items];
  for (let at = out.length - 1; at > 0; at -= 1) {
    const drawn = below(at + 1);
    const pick = Number.isInteger(drawn) ? Math.min(Math.max(drawn, 0), at) : 0;
    [out[at], out[pick]] = [out[pick] as Item, out[at] as Item];
  }
  return out;
};

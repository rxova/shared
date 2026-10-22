import { notifiedFallbacks } from "@/internal/random/notified-fallbacks";
import type { RandomBelowOptions } from "@/random/random-below.types";

/** 2 ** 32, the number of values one `Uint32Array` slot can hold. */
const RANGE = 4294967296;

/**
 * A whole number from 0 up to but not including `bound`, drawn without bias
 * from `crypto.getRandomValues`.
 *
 * The obvious `getRandomValues(...)[0] % bound` is not uniform unless `bound`
 * divides 2³² exactly: the low values come up slightly more often, because the
 * last, partial block of the 32-bit range favours them. The bias is tiny for a
 * handful of quiz options and plainly wrong for anything that is audited, so
 * the partial block is rejected and redrawn instead — on average well under
 * one extra draw, and never an unbounded wait for any `bound` this accepts.
 *
 * Where `getRandomValues` is missing, the draw falls back to `Math.random` and
 * `onFallback` is told once, exactly as `randomHex` does.
 */
export const randomBelow = (bound: number, { onFallback }: RandomBelowOptions = {}): number => {
  if (!Number.isInteger(bound) || bound < 1 || bound > RANGE) {
    throw new RangeError(
      `randomBelow: bound must be an integer from 1 to 2 ** 32, got ${String(bound)}`,
    );
  }

  const crypto = (globalThis as { crypto?: Partial<Crypto> }).crypto;
  if (typeof crypto?.getRandomValues === "function") {
    // The largest multiple of `bound` that fits: everything at or above it is
    // the partial block, and is drawn again rather than folded back in.
    const limit = RANGE - (RANGE % bound);
    const slot = new Uint32Array(1);
    for (;;) {
      const [drawn = 0] = crypto.getRandomValues(slot);
      if (drawn < limit) return drawn % bound;
    }
  }

  if (onFallback !== undefined && !notifiedFallbacks.has(onFallback)) {
    notifiedFallbacks.add(onFallback);
    onFallback();
  }
  return Math.floor(Math.random() * bound);
};

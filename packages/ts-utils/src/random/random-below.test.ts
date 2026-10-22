import { afterEach, describe, expect, it, vi } from "vitest";
import { randomBelow } from "@/random/random-below";

/** Replaces `crypto` with one handing out `values` in order, then repeating the last. */
const withDraws = (...values: number[]): void => {
  let at = 0;
  vi.stubGlobal("crypto", {
    getRandomValues: (slot: Uint32Array) => {
      slot[0] = values[Math.min(at, values.length - 1)] ?? 0;
      at += 1;
      return slot;
    },
  });
};

describe("randomBelow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stays inside the bound over many draws", () => {
    const seen = new Set<number>();
    for (let n = 0; n < 500; n += 1) seen.add(randomBelow(4));
    expect([...seen].sort()).toEqual([0, 1, 2, 3]);
  });

  it("always answers 0 for a bound of 1", () => {
    expect(randomBelow(1)).toBe(0);
  });

  it("redraws the partial block instead of folding it back in", () => {
    // 2 ** 32 % 3 is 1, so the limit is 2 ** 32 - 1: that value must be redrawn.
    withDraws(4294967295, 7);
    expect(randomBelow(3)).toBe(1);
  });

  it("takes a draw that is inside the limit as it is", () => {
    withDraws(10);
    expect(randomBelow(4)).toBe(2);
  });

  it("refuses a bound that is not a whole number in range", () => {
    for (const bad of [0, -1, 1.5, Number.NaN, 4294967297]) {
      expect(() => randomBelow(bad)).toThrow(RangeError);
    }
    expect(() => randomBelow(0)).toThrow("randomBelow: bound must be an integer from 1 to 2 ** 32");
  });

  it("falls back to Math.random and says so once per callback", () => {
    vi.stubGlobal("crypto", undefined);
    vi.spyOn(Math, "random").mockReturnValue(0.75);
    const onFallback = vi.fn();
    expect(randomBelow(4, { onFallback })).toBe(3);
    expect(randomBelow(4, { onFallback })).toBe(3);
    expect(onFallback).toHaveBeenCalledTimes(1);
    expect(randomBelow(4)).toBe(3);
  });
});

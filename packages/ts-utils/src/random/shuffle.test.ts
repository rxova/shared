import { describe, expect, it, vi } from "vitest";
import { shuffle } from "@/random/shuffle";

describe("shuffle", () => {
  it("keeps the same items and leaves the input alone", () => {
    const items = ["a", "b", "c", "d"];
    const out = shuffle(items);
    expect([...out].sort()).toEqual(["a", "b", "c", "d"]);
    expect(items).toEqual(["a", "b", "c", "d"]);
  });

  it("is the identity when every draw picks the last position", () => {
    expect(shuffle(["a", "b", "c"], (bound) => bound - 1)).toEqual(["a", "b", "c"]);
  });

  it("reverses nothing it cannot: an empty list and a single item", () => {
    const below = vi.fn();
    expect(shuffle([], below)).toEqual([]);
    expect(shuffle(["a"], below)).toEqual(["a"]);
    expect(below).not.toHaveBeenCalled();
  });

  it("draws from the positions at or before each one, counting down", () => {
    const below = vi.fn(() => 0);
    expect(shuffle(["a", "b", "c"], below)).toEqual(["b", "c", "a"]);
    expect(below.mock.calls).toEqual([[3], [2]]);
  });

  it("clamps a draw that lies outside the range rather than trusting it", () => {
    // Clamped to `at`, which is a swap with itself; clamped to 0, which is a real swap.
    expect(shuffle(["a", "b"], () => 99)).toEqual(["a", "b"]);
    expect(shuffle(["a", "b"], () => -5)).toEqual(["b", "a"]);
    expect(shuffle(["a", "b"], () => Number.NaN)).toEqual(["b", "a"]);
  });

  it("reaches every permutation of three items", () => {
    const seen = new Set<string>();
    for (let n = 0; n < 500; n += 1) seen.add(shuffle(["a", "b", "c"]).join(""));
    expect(seen.size).toBe(6);
  });
});

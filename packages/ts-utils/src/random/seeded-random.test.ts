import { describe, expect, it } from "vitest";
import { seededRandom } from "@/random/seeded-random";
import { shuffle } from "@/random/shuffle";

describe("seededRandom", () => {
  it("gives the same sequence for the same seed, and a different one otherwise", () => {
    const first = seededRandom(42);
    const again = seededRandom(42);
    const other = seededRandom(43);
    const three = [first(), first(), first()];
    expect([again(), again(), again()]).toEqual(three);
    expect([other(), other(), other()]).not.toEqual(three);
  });

  it("stays in [0, 1)", () => {
    const next = seededRandom(7);
    for (let n = 0; n < 1000; n += 1) {
      const drawn = next();
      expect(drawn).toBeGreaterThanOrEqual(0);
      expect(drawn).toBeLessThan(1);
    }
  });

  it("is the sequence this package promises to keep", () => {
    const next = seededRandom(1);
    expect([next(), next(), next()].map((n) => n.toFixed(10))).toEqual([
      "0.6270739406",
      "0.0027357212",
      "0.5274470400",
    ]);
  });

  it("treats a seed as 32 bits, so a negative one is fine", () => {
    expect(seededRandom(-1)()).toBe(seededRandom(4294967295)());
  });

  it("drives a shuffle that comes back the same after a reload", () => {
    const order = (seed: number): string[] =>
      shuffle(["a", "b", "c", "d"], (bound) => Math.floor(seededRandom(seed)() * bound));
    expect(order(99)).toEqual(order(99));
  });
});

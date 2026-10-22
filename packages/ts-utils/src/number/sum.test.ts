import { describe, expect, it } from "vitest";
import { sum } from "@/number/sum";

describe("sum", () => {
  it.each([
    [[], 0],
    [[5], 5],
    [[1, 2, 3], 6],
    [[1.5, -0.5], 1],
  ])("adds %j up to %d", (values, expected) => {
    expect(sum(values)).toBe(expected);
  });

  it("takes any iterable, such as a map's values", () => {
    expect(
      sum(
        new Map([
          ["a", 2],
          ["b", 3],
        ]).values(),
      ),
    ).toBe(5);
  });

  it("keeps NaN visible", () => {
    expect(sum([1, Number.NaN, 2])).toBeNaN();
  });
});

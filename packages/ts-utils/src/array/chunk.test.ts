import { describe, expect, it } from "vitest";
import { chunk } from "@/array/chunk";

describe("chunk", () => {
  it.each([
    [
      [1, 2, 3, 4],
      2,
      [
        [1, 2],
        [3, 4],
      ],
    ],
    [[1, 2, 3, 4, 5], 2, [[1, 2], [3, 4], [5]]],
    [[1, 2], 5, [[1, 2]]],
    [[1, 2, 3], 1, [[1], [2], [3]]],
    [[], 3, []],
  ])("cuts %j into runs of %d", (items, size, expected) => {
    expect(chunk(items, size)).toEqual(expected);
  });

  it("copies, so a run can be changed without touching the input", () => {
    const items = [1, 2, 3];
    const [first] = chunk(items, 2);
    first?.push(9);
    expect(items).toEqual([1, 2, 3]);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY])("throws for a size of %d", (size) => {
    expect(() => chunk([1], size)).toThrow(RangeError);
  });
});

import { describe, expect, it } from "vitest";
import { isFiniteNumber } from "@/predicates/is-finite-number";

describe("isFiniteNumber", () => {
  it.each([0, -0, 1.5, -42, Number.MAX_VALUE, Number.MIN_VALUE])("accepts %d", (value) => {
    expect(isFiniteNumber(value)).toBe(true);
  });

  it.each([
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["-Infinity", Number.NEGATIVE_INFINITY],
    ["a numeric string", "1"],
    ["a boxed number", Object(1)],
    ["a bigint", 1n],
    ["null", null],
    ["undefined", undefined],
  ])("rejects %s", (_label, value) => {
    expect(isFiniteNumber(value)).toBe(false);
  });
});

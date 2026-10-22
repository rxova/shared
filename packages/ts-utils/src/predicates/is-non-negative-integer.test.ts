import { describe, expect, it } from "vitest";
import { isNonNegativeInteger } from "@/predicates/is-non-negative-integer";

describe("isNonNegativeInteger", () => {
  it.each([0, -0, 1, 42, Number.MAX_SAFE_INTEGER])("accepts %d", (value) => {
    expect(isNonNegativeInteger(value)).toBe(true);
  });

  it.each([
    ["a negative integer", -1],
    ["a fraction", 1.5],
    ["an unsafe integer", Number.MAX_SAFE_INTEGER + 1],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["a numeric string", "1"],
    ["a bigint", 1n],
    ["null", null],
  ])("rejects %s", (_label, value) => {
    expect(isNonNegativeInteger(value)).toBe(false);
  });
});

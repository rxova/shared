import { describe, expect, it } from "vitest";
import { jsonEqual } from "@/json/json-equal";

describe("jsonEqual", () => {
  it("ignores key order, at any depth", () => {
    expect(jsonEqual({ a: 1, b: { c: 2, d: 3 } }, { b: { d: 3, c: 2 }, a: 1 })).toBe(true);
  });

  it("still sees a real difference, array order included", () => {
    expect(jsonEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(jsonEqual([1, 2], [2, 1])).toBe(false);
  });

  it("counts only what JSON can carry", () => {
    expect(jsonEqual({ a: undefined }, {})).toBe(true);
    expect(jsonEqual(undefined, undefined)).toBe(true);
  });
});

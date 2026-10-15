import { describe, expect, it } from "vitest";
import { valueAt } from "@/internal/statusline/value-at";

describe("valueAt", () => {
  const json: unknown = { a: { b: { c: 3 }, list: [1, 2], nothing: null } };

  it("follows the path through nested objects", () => {
    expect(valueAt(json, "a", "b", "c")).toBe(3);
    expect(valueAt(json, "a", "list")).toEqual([1, 2]);
  });

  it("returns the value itself for an empty path", () => {
    expect(valueAt(json)).toBe(json);
  });

  it("is undefined when a step is missing", () => {
    expect(valueAt(json, "a", "x", "c")).toBeUndefined();
  });

  it("does not step into arrays, null or primitives", () => {
    expect(valueAt(json, "a", "list", "0")).toBeUndefined();
    expect(valueAt(json, "a", "nothing", "x")).toBeUndefined();
    expect(valueAt(json, "a", "b", "c", "d")).toBeUndefined();
    expect(valueAt(null, "a")).toBeUndefined();
    expect(valueAt("text", "length")).toBeUndefined();
  });
});

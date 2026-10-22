import { describe, expect, it } from "vitest";
import { hashString } from "@/string/hash-string";

describe("hashString", () => {
  it("is the FNV-1a 32-bit value, which this package promises to keep", () => {
    expect(hashString("")).toBe(2166136261);
    expect(hashString("a")).toBe(3826002220);
    expect(hashString("hello")).toBe(1335831723);
  });

  it("is stable, unsigned and a whole number", () => {
    const hash = hashString("the quick brown fox");
    expect(hashString("the quick brown fox")).toBe(hash);
    expect(Number.isInteger(hash)).toBe(true);
    expect(hash).toBeGreaterThanOrEqual(0);
    expect(hash).toBeLessThan(4294967296);
  });

  it("separates near-identical text, order included", () => {
    expect(hashString("ab")).not.toBe(hashString("ba"));
    expect(hashString("a")).not.toBe(hashString("A"));
  });
});

import { describe, expect, it } from "vitest";
import { readCount } from "@/internal/config/read-count";

describe("readCount", () => {
  it("reads a positive integer or nothing", () => {
    expect(readCount({ a: 3 }, "a", "p")).toBe(3);
    expect(readCount({}, "a", "p")).toBeUndefined();
  });

  it.each([0, -1, 1.5, "3"])("refuses %j", (value) => {
    expect(() => readCount({ a: value }, "a", "p")).toThrow("p.a must be a positive integer");
  });
});

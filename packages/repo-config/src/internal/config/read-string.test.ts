import { describe, expect, it } from "vitest";
import { readString } from "@/internal/config/read-string";

describe("readString", () => {
  it("reads a non-empty string or nothing", () => {
    expect(readString({ a: "x" }, "a", "p")).toBe("x");
    expect(readString({}, "a", "p")).toBeUndefined();
  });

  it.each(["", 1, null])("refuses %j", (value) => {
    expect(() => readString({ a: value }, "a", "p")).toThrow("p.a must be a non-empty string");
  });
});

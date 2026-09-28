import { describe, expect, it } from "vitest";
import { readStrings } from "@/internal/config/read-strings";

describe("readStrings", () => {
  it("reads an array of strings or nothing", () => {
    expect(readStrings({ a: ["x", "y"] }, "a", "p")).toEqual(["x", "y"]);
    expect(readStrings({ a: [] }, "a", "p")).toEqual([]);
    expect(readStrings({}, "a", "p")).toBeUndefined();
  });

  it.each([["x"], [[""]], [[1]]])("refuses %j", (value) => {
    expect(() => readStrings({ a: value }, "a", "p")).toThrow(
      "p.a must be an array of non-empty strings",
    );
  });
});

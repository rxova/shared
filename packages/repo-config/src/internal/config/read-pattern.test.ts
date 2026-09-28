import { describe, expect, it } from "vitest";
import { readPattern } from "@/internal/config/read-pattern";

describe("readPattern", () => {
  it("reads a regex source that compiles, or nothing", () => {
    expect(readPattern({ a: "\\bfoo\\b" }, "a", "p")).toBe("\\bfoo\\b");
    expect(readPattern({ a: "x" }, "a", "p", "i")).toBe("x");
    expect(readPattern({}, "a", "p")).toBeUndefined();
  });

  it("refuses a source that does not compile", () => {
    expect(() => readPattern({ a: "(" }, "a", "p")).toThrow(
      "package.json#p.a must be a valid regular expression",
    );
  });
});

import { describe, expect, it } from "vitest";
import { readBoolean } from "@/internal/config/read-boolean";

describe("readBoolean", () => {
  it("reads a boolean or nothing", () => {
    expect(readBoolean({ a: false }, "a", "p")).toBe(false);
    expect(readBoolean({}, "a", "p")).toBeUndefined();
  });

  it("refuses anything else", () => {
    expect(() => readBoolean({ a: "yes" }, "a", "p")).toThrow("package.json#p.a must be a boolean");
  });
});

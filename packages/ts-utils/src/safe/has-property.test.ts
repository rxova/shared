import { describe, expect, it } from "vitest";
import { hasProperty } from "@/safe/has-property";
import { hostile } from "@/safe/safe-values.fixtures";

describe("hasProperty", () => {
  it("follows the prototype chain, like `in`", () => {
    expect(hasProperty({}, "toString")).toBe(true);
    expect(hasProperty({}, "missing")).toBe(false);
  });

  it("is false when a proxy refuses", () => {
    expect(hasProperty(hostile(), "a")).toBe(false);
  });
});

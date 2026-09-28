import { describe, expect, it } from "vitest";
import { isInstanceOf } from "@/safe/is-instance-of";

describe("isInstanceOf", () => {
  it("narrows an instance", () => {
    expect(isInstanceOf(new Error("x"), Error)).toBe(true);
    expect(isInstanceOf({}, Error)).toBe(false);
  });

  it("is false when Symbol.hasInstance throws", () => {
    class Hostile {
      readonly kind = "hostile";
      static [Symbol.hasInstance](): boolean {
        throw new Error("hasInstance");
      }
    }
    expect(isInstanceOf({}, Hostile)).toBe(false);
  });
});

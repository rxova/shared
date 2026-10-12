import { describe, expect, it } from "vitest";
import { parseSplit } from "@/internal/config/parse-split";

describe("parseSplit", () => {
  it("reads true as no limit, and keeps a max", () => {
    expect(parseSplit({}, "s")).toBeUndefined();
    expect(parseSplit({ split: true }, "s")).toEqual({});
    expect(parseSplit({ split: {} }, "s")).toEqual({});
    expect(parseSplit({ split: { max: 4 } }, "s")).toEqual({ max: 4 });
  });

  it.each([false, "yes", 3, []])("refuses the split %j", (split) => {
    expect(() => parseSplit({ split }, "s")).toThrow("s.split must be true or a { max } object");
  });

  it.each([0, -1, 1.5, "8"])("refuses the max %j", (max) => {
    expect(() => parseSplit({ split: { max } }, "s")).toThrow(
      "s.split.max must be a positive integer",
    );
  });
});

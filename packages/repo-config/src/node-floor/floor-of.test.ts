import { describe, expect, it } from "vitest";
import { floorOf } from "@/node-floor/floor-of";

describe("floorOf", () => {
  it.each([
    [">=22.13", "22.13"],
    [">= 20.11.0", "20.11.0"],
    [">=v22", "22"],
  ])("reads %s as %s", (range, floor) => {
    expect(floorOf(range)).toBe(floor);
  });

  it.each(["^22.13", ">=22 <25", "22.x", "*", ""])('has no single floor for "%s"', (range) => {
    expect(floorOf(range)).toBeUndefined();
  });
});

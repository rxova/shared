import { describe, expect, it } from "vitest";
import { heatColor } from "@/internal/statusline/heat-color";

describe("heatColor", () => {
  it.each([
    [0, [166, 227, 161]],
    [50, [249, 226, 175]],
    [75, [250, 179, 135]],
    [90, [243, 139, 168]],
  ] as const)("is exactly the stop colour at %i%%", (percent, rgb) => {
    expect(heatColor(percent)).toEqual(rgb);
  });

  it("blends between the two stops around a value", () => {
    expect(heatColor(25)).toEqual([208, 227, 168]);
    expect(heatColor(82.5)).toEqual([247, 159, 152]);
  });

  it("stays red above 90% and clamps beyond 100%", () => {
    expect(heatColor(100)).toEqual([243, 139, 168]);
    expect(heatColor(250)).toEqual([243, 139, 168]);
  });

  it("clamps below 0% to green", () => {
    expect(heatColor(-20)).toEqual([166, 227, 161]);
  });
});

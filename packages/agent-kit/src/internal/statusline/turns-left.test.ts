import { describe, expect, it } from "vitest";
import { turnsLeft } from "@/internal/statusline/turns-left";

describe("turnsLeft", () => {
  it("is undefined until two turns have grown the context", () => {
    expect(turnsLeft([], 200_000)).toBeUndefined();
    expect(turnsLeft([10_000], 200_000)).toBeUndefined();
    expect(turnsLeft([10_000, 20_000], 200_000)).toBeUndefined();
    expect(turnsLeft([30_000, 20_000, 20_000, 40_000], 200_000)).toBeUndefined();
  });

  it("divides the room left by the average growth per turn, rounding down", () => {
    expect(turnsLeft([20_000, 40_000, 60_000], 200_000)).toBe(7);
    expect(turnsLeft([10_000, 20_000, 40_000], 200_000)).toBe(10);
  });

  it("leaves compactions and repeats out of the average", () => {
    expect(turnsLeft([100_000, 120_000, 30_000, 30_000, 50_000], 200_000)).toBe(7);
  });

  it("never goes below zero", () => {
    expect(turnsLeft([180_000, 190_000, 210_000], 200_000)).toBe(0);
  });
});

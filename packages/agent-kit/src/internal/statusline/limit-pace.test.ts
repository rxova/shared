import { describe, expect, it } from "vitest";
import { limitPace } from "@/internal/statusline/limit-pace";

const FIVE_HOURS = 5 * 3600;
const NOW = 1_800_000_000;
// Half the window gone: 2h30m elapsed, 2h30m to the reset.
const half = { windowSeconds: FIVE_HOURS, now: NOW, resetsAt: NOW + FIVE_HOURS / 2 };

describe("limitPace", () => {
  it("gives the pace alone when the limit lasts until the reset", () => {
    expect(limitPace({ ...half, usedPercentage: 35 })).toEqual({ pace: 0.7 });
    expect(limitPace({ ...half, usedPercentage: 50 })).toEqual({ pace: 1 });
  });

  it("adds when the limit runs out, at this rate, before the reset", () => {
    expect(limitPace({ ...half, usedPercentage: 80 })).toEqual({ pace: 1.6, exhaustsIn: 2250 });
  });

  it("says out now for a limit already used up", () => {
    expect(limitPace({ ...half, usedPercentage: 100 })).toEqual({ pace: 2, exhaustsIn: 0 });
    expect(limitPace({ ...half, usedPercentage: 120 })).toEqual({ pace: 2.4, exhaustsIn: 0 });
  });

  it("is undefined without a reset time, or once the reset has passed", () => {
    expect(limitPace({ usedPercentage: 50, windowSeconds: FIVE_HOURS, now: NOW })).toBeUndefined();
    expect(limitPace({ ...half, resetsAt: NOW, usedPercentage: 50 })).toBeUndefined();
    expect(limitPace({ ...half, resetsAt: NOW - 1, usedPercentage: 50 })).toBeUndefined();
  });

  it("is undefined with nothing used", () => {
    expect(limitPace({ ...half, usedPercentage: 0 })).toBeUndefined();
  });

  it("waits for a twentieth of the window before judging the rate", () => {
    const twentieth = FIVE_HOURS / 20;
    expect(
      limitPace({ ...half, resetsAt: NOW + FIVE_HOURS - twentieth + 1, usedPercentage: 1 }),
    ).toBeUndefined();
    expect(
      limitPace({ ...half, resetsAt: NOW + FIVE_HOURS - twentieth, usedPercentage: 1 }),
    ).toEqual({ pace: 0.2 });
  });
});

import { describe, expect, it } from "vitest";
import { formatDuration } from "@/internal/statusline/format-duration";

describe("formatDuration", () => {
  it.each([
    [0, "0s"],
    [45.9, "45s"],
    [59, "59s"],
    [60, "1m"],
    [3599, "59m"],
    [3600, "1h00m"],
    [3900, "1h05m"],
    [86_399, "23h59m"],
    [86_400, "1d00h"],
    [3 * 86_400 + 4 * 3600 + 59, "3d04h"],
  ])("writes %f seconds as %s", (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });

  it("treats a negative span as zero", () => {
    expect(formatDuration(-30)).toBe("0s");
  });
});

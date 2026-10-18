import { describe, expect, it } from "vitest";
import { run } from "@/internal/statusline/run";
import { runsWidth } from "@/internal/statusline/runs-width";

describe("runsWidth", () => {
  it("is zero for no runs", () => {
    expect(runsWidth([])).toBe(0);
  });

  it("sums the runs' text", () => {
    expect(runsWidth([run([1, 2, 3], "ab"), run([1, 2, 3], "cde")])).toBe(5);
  });

  it("counts a grapheme as one cell, however many code points it has", () => {
    expect(runsWidth([run([1, 2, 3], "🙂")])).toBe(1);
    expect(runsWidth([run([1, 2, 3], "👩‍👩‍👧")])).toBe(1);
  });

  it("counts the colour as nothing, because runs hold no escape codes", () => {
    expect(runsWidth([run([243, 139, 168], "ab", true, "https://example.test")])).toBe(2);
  });
});

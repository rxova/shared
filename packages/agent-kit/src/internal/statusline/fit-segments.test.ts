import { describe, expect, it } from "vitest";
import { fitSegments } from "@/internal/statusline/fit-segments";
import { paint } from "@/internal/statusline/paint";

const segment = (text: string, priority: number) => ({ text, priority });

describe("fitSegments", () => {
  it("joins every segment when the line fits", () => {
    expect(fitSegments([segment("aa", 1), segment("bb", 2)], " | ", 7)).toBe("aa | bb");
  });

  it("skips empty segments and returns empty for none", () => {
    expect(fitSegments([], " | ", 80)).toBe("");
    expect(fitSegments([segment("", 9), segment("", 1)], " | ", 80)).toBe("");
    expect(fitSegments([segment("", 9), segment("aa", 1)], " | ", 80)).toBe("aa");
  });

  it("drops the lowest priorities first, keeping the order of the rest", () => {
    const segments = [segment("aa", 5), segment("bb", 1), segment("cc", 9), segment("dd", 3)];
    expect(fitSegments(segments, " ", 8)).toBe("aa cc dd");
    expect(fitSegments(segments, " ", 7)).toBe("aa cc");
    expect(fitSegments(segments, " ", 4)).toBe("cc");
  });

  it("drops the last of equal priorities first", () => {
    expect(fitSegments([segment("aa", 5), segment("bb", 3), segment("cc", 3)], " ", 5)).toBe(
      "aa bb",
    );
    expect(fitSegments([segment("aa", 3), segment("bb", 3), segment("cc", 5)], " ", 5)).toBe(
      "aa cc",
    );
  });

  it("always keeps the highest-priority segment, even when it alone is too wide", () => {
    expect(fitSegments([segment("small", 1), segment("very wide", 9)], " ", 2)).toBe("very wide");
  });

  it("measures visible width, not escape codes", () => {
    const colored = [segment(paint([1, 2, 3], "aa", "truecolor"), 2), segment("bb", 1)];
    expect(fitSegments(colored, " ", 5)).toBe(`${colored[0]?.text ?? ""} bb`);
  });
});

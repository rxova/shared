import { describe, expect, it } from "vitest";
import { fitSegments } from "@/internal/statusline/fit-segments";
import { paintRuns } from "@/internal/statusline/paint-runs";
import { run } from "@/internal/statusline/run";

const segment = (text: string, priority: number) => ({
  runs: text === "" ? [] : [run([1, 2, 3], text)],
  priority,
});
const bar = [run([0, 0, 0], " | ")];
const space = [run([0, 0, 0], " ")];
const joined = (
  segments: readonly ReturnType<typeof segment>[],
  sep: readonly ReturnType<typeof run>[],
  columns: number,
) => paintRuns(fitSegments(segments, sep, columns), "none");

describe("fitSegments", () => {
  it("joins every segment when the line fits", () => {
    expect(joined([segment("aa", 1), segment("bb", 2)], bar, 7)).toBe("aa | bb");
  });

  it("skips empty segments and returns none for an empty line", () => {
    expect(fitSegments([], bar, 80)).toEqual([]);
    expect(fitSegments([segment("", 9), segment("", 1)], bar, 80)).toEqual([]);
    expect(joined([segment("", 9), segment("aa", 1)], bar, 80)).toBe("aa");
  });

  it("drops the lowest priorities first, keeping the order of the rest", () => {
    const segments = [segment("aa", 5), segment("bb", 1), segment("cc", 9), segment("dd", 3)];
    expect(joined(segments, space, 8)).toBe("aa cc dd");
    expect(joined(segments, space, 7)).toBe("aa cc");
    expect(joined(segments, space, 4)).toBe("cc");
  });

  it("drops the last of equal priorities first", () => {
    expect(joined([segment("aa", 5), segment("bb", 3), segment("cc", 3)], space, 5)).toBe("aa bb");
    expect(joined([segment("aa", 3), segment("bb", 3), segment("cc", 5)], space, 5)).toBe("aa cc");
  });

  it("always keeps the highest-priority segment, even when it alone is too wide", () => {
    expect(joined([segment("small", 1), segment("very wide", 9)], space, 2)).toBe("very wide");
  });

  it("measures the runs' text, so colour costs no width", () => {
    const wide = { runs: [run([243, 139, 168], "aa", true)], priority: 2 };
    expect(joined([wide, segment("bb", 1)], space, 5)).toBe("aa bb");
  });

  it("returns the separator between segments as its own runs", () => {
    expect(fitSegments([segment("aa", 1), segment("bb", 1)], bar, 80)).toHaveLength(3);
  });
});

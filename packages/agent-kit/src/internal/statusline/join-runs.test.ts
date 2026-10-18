import { describe, expect, it } from "vitest";
import { joinRuns } from "@/internal/statusline/join-runs";
import { paintRuns } from "@/internal/statusline/paint-runs";
import { run } from "@/internal/statusline/run";

const gap = run([0, 0, 0], " ");
const text = (parts: readonly (readonly ReturnType<typeof run>[])[]) =>
  paintRuns(joinRuns(parts, gap), "none");

describe("joinRuns", () => {
  it("is empty for no parts", () => {
    expect(joinRuns([], gap)).toEqual([]);
  });

  it("puts the separator between parts, not around them", () => {
    expect(text([[run([1, 2, 3], "a")], [run([1, 2, 3], "b")]])).toBe("a b");
  });

  it("drops parts that carry no text", () => {
    expect(text([[run([1, 2, 3], "a")], [], [run([1, 2, 3], "")], [run([1, 2, 3], "b")]])).toBe(
      "a b",
    );
  });

  it("keeps a multi-run part together, separating only between parts", () => {
    expect(text([[run([1, 2, 3], "●●"), run([4, 5, 6], "○○○")], [run([1, 2, 3], "b")]])).toBe(
      "●●○○○ b",
    );
  });
});

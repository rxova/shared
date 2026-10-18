import { describe, expect, it } from "vitest";
import { paintRuns } from "@/internal/statusline/paint-runs";
import { run } from "@/internal/statusline/run";

const ESC = "\u001b";
const BEL = "\u0007";

describe("paintRuns", () => {
  it("is empty for no runs", () => {
    expect(paintRuns([], "truecolor")).toBe("");
  });

  it("joins the runs with no separator of its own", () => {
    expect(paintRuns([run([1, 2, 3], "ab"), run([4, 5, 6], "cd")], "none")).toBe("abcd");
  });

  it("paints each run in its own colour", () => {
    expect(paintRuns([run([243, 139, 168], "x")], "truecolor")).toBe(
      `${ESC}[38;2;243;139;168mx${ESC}[0m`,
    );
  });

  it("wraps a run carrying a href in a hyperlink, outside the colour", () => {
    expect(paintRuns([run([1, 2, 3], "pr", false, "https://example.test")], "none")).toBe(
      `${ESC}]8;;https://example.test${BEL}pr${ESC}]8;;${BEL}`,
    );
  });
});

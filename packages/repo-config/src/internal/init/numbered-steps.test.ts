import { describe, expect, it } from "vitest";
import { numberedSteps } from "@/internal/init/numbered-steps";

describe("numberedSteps", () => {
  it("numbers the first line of each step and indents the rest", () => {
    expect(numberedSteps([["one"], ["two", "more"], ["three"]])).toEqual([
      "next:",
      "  1. one",
      "  2. two",
      "     more",
      "  3. three",
    ]);
  });

  it("skips empty steps without leaving a gap in the numbers", () => {
    expect(numberedSteps([["one"], [], ["two"]])).toEqual(["next:", "  1. one", "  2. two"]);
  });

  it("is only the heading when nothing is left", () => {
    expect(numberedSteps([[]])).toEqual(["next:"]);
  });
});

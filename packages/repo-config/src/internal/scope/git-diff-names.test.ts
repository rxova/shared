import { describe, expect, it } from "vitest";
import { gitDiffNames } from "@/internal/scope/git-diff-names";

describe("gitDiffNames", () => {
  it("lists the files an empty range changed — none", () => {
    expect(gitDiffNames("HEAD", "HEAD")).toEqual([]);
  });
});

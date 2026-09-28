import { describe, expect, it } from "vitest";
import { gitDiffDeleted } from "@/internal/scope/git-diff-deleted";

describe("gitDiffDeleted", () => {
  it("lists the files an empty range deleted — none", () => {
    expect(gitDiffDeleted("HEAD", "HEAD")).toEqual([]);
  });
});

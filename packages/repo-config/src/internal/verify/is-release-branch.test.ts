import { describe, expect, it } from "vitest";
import { isReleaseBranch } from "@/internal/verify/is-release-branch";

describe("isReleaseBranch", () => {
  it("is true only for the changesets version branch", () => {
    expect(isReleaseBranch({ GITHUB_HEAD_REF: "changeset-release/main" })).toBe(true);
    expect(isReleaseBranch({ GITHUB_HEAD_REF: "feat/x" })).toBe(false);
    expect(isReleaseBranch({})).toBe(false);
  });
});

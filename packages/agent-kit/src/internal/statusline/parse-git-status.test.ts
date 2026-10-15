import { describe, expect, it } from "vitest";
import { parseGitStatus } from "@/internal/statusline/parse-git-status";

const lines = (...rows: string[]) => rows.join("\n");

describe("parseGitStatus", () => {
  it("reads the branch, upstream, ahead/behind, stashes and every kind of change", () => {
    const output = lines(
      "# branch.oid 0123456789abcdef0123456789abcdef01234567",
      "# branch.head feat/x",
      "# branch.upstream origin/feat/x",
      "# branch.ab +2 -3",
      "# stash 4",
      "1 M. N... 100644 100644 100644 a b staged.ts",
      "1 .M N... 100644 100644 100644 a b modified.ts",
      "1 MM N... 100644 100644 100644 a b both.ts",
      "2 R. N... 100644 100644 100644 a b R100 new.ts\told.ts",
      "u UU N... 100644 100644 100644 100644 a b c conflict.ts",
      "? new-a.ts",
      "? new-b.ts",
      "! ignored.log",
      "",
    );
    expect(parseGitStatus(output)).toEqual({
      branch: "feat/x",
      detached: false,
      ahead: 2,
      behind: 3,
      hasUpstream: true,
      staged: 3,
      modified: 2,
      untracked: 2,
      conflicts: 1,
      stashes: 4,
    });
  });

  it("reports no upstream when the branch tracks nothing", () => {
    const state = parseGitStatus(lines("# branch.oid abc", "# branch.head main"));
    expect(state).toMatchObject({ branch: "main", hasUpstream: false, ahead: 0, behind: 0 });
  });

  it("names a detached HEAD by its short commit", () => {
    const state = parseGitStatus(
      lines("# branch.oid 0123456789abcdef0123456789abcdef01234567", "# branch.head (detached)"),
    );
    expect(state).toMatchObject({ branch: "0123456", detached: true });
  });

  it("keeps the branch name in a repository with no commits", () => {
    const state = parseGitStatus(lines("# branch.oid (initial)", "# branch.head main"));
    expect(state).toMatchObject({ branch: "main", detached: false });
  });

  it("treats malformed counts as zero", () => {
    const state = parseGitStatus(lines("# branch.ab +x", "# stash many"));
    expect(state).toMatchObject({ ahead: 0, behind: 0, stashes: 0 });
  });

  it("is a clean, nameless state for empty output", () => {
    expect(parseGitStatus("")).toEqual({
      branch: "",
      detached: false,
      ahead: 0,
      behind: 0,
      hasUpstream: false,
      staged: 0,
      modified: 0,
      untracked: 0,
      conflicts: 0,
      stashes: 0,
    });
  });
});

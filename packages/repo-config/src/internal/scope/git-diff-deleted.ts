import { execFileSync } from "node:child_process";
import { revisionRange } from "@/internal/scope/revision-range";

/** The paths a commit range deleted; a rename counts as a deletion of its old path. */
export const gitDiffDeleted = (base: string, head: string): string[] =>
  execFileSync(
    "git",
    ["diff", "--name-only", "--no-renames", "--diff-filter=D", revisionRange(base, head)],
    { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
  )
    .split("\n")
    .filter(Boolean);

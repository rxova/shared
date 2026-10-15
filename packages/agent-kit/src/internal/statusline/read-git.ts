import type { GitState } from "@/internal/statusline/statusline.types";
import { parseGitStatus } from "@/internal/statusline/parse-git-status";

/**
 * The repository state at `cwd`, through `run` (git's stdout, or undefined when it fails), or
 * undefined outside a repository. Falls back to plain `--branch` on a git too old for
 * `--show-stash`.
 */
export const readGit = (
  cwd: string,
  run: (args: readonly string[]) => string | undefined,
): GitState | undefined => {
  if (cwd === "") return undefined;
  const status =
    run(["-C", cwd, "status", "--porcelain=v2", "--branch", "--show-stash"]) ??
    run(["-C", cwd, "status", "--porcelain=v2", "--branch"]);
  if (status === undefined) return undefined;
  const state = parseGitStatus(status);
  const committed = Number.parseInt(run(["-C", cwd, "log", "-1", "--format=%ct"]) ?? "", 10);
  return Number.isNaN(committed) ? state : { ...state, lastCommitAt: committed };
};

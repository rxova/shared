import type { Worktree } from "../types";

/** The worktrees `git worktree list --porcelain` lists, without their pull requests. */
export const parseWorktrees = (porcelain: string): Omit<Worktree, "pr">[] =>
  porcelain
    .split("\n\n")
    .map((block) => block.split("\n").filter((line) => line !== ""))
    .filter((lines) => lines[0]?.startsWith("worktree ") === true)
    .map((lines) => {
      const field = (name: string) =>
        lines.find((line) => line === name || line.startsWith(`${name} `));
      const branch = field("branch")?.slice("branch refs/heads/".length);

      return {
        path: (field("worktree") ?? "").slice("worktree ".length),
        branch: branch ?? (field("bare") === undefined ? "(detached)" : "(bare)"),
        isPrunable: field("prunable") !== undefined,
      };
    });

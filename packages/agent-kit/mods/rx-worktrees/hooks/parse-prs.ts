import type { Worktree } from "../types";

/** The newest pull request per head branch, from `gh pr list --json headRefName,number,state`; empty when the JSON does not parse. */
export const parsePrs = (json: string): Map<string, NonNullable<Worktree["pr"]>> => {
  const byBranch = new Map<string, NonNullable<Worktree["pr"]>>();
  try {
    const list = JSON.parse(json) as { headRefName: string; number: number; state: string }[];
    for (const pr of list) {
      if (!byBranch.has(pr.headRefName)) {
        byBranch.set(pr.headRefName, { number: pr.number, state: pr.state });
      }
    }
  } catch {
    // gh missing or not a GitHub repository: rows show no PR.
  }

  return byBranch;
};

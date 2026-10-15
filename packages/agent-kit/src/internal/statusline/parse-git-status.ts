import type { GitState } from "@/internal/statusline/statusline.types";

/** The branch and change counts in `git status --porcelain=v2 --branch --show-stash` output. */
export const parseGitStatus = (output: string): GitState => {
  const state: GitState = {
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
  };
  let oid = "";
  for (const line of output.split("\n")) {
    const [kind = "", first = "", second = ""] = line.split(" ");
    if (kind === "#" && first === "branch.head") state.branch = second;
    else if (kind === "#" && first === "branch.oid") oid = second;
    else if (kind === "#" && first === "branch.upstream") state.hasUpstream = true;
    else if (kind === "#" && first === "branch.ab") {
      state.ahead = Math.abs(Number.parseInt(second, 10)) || 0;
      state.behind = Math.abs(Number.parseInt(line.split(" ")[3] ?? "", 10)) || 0;
    } else if (kind === "#" && first === "stash") state.stashes = Number.parseInt(second, 10) || 0;
    else if (kind === "1" || kind === "2") {
      if (!first.startsWith(".")) state.staged += 1;
      if (first.charAt(1) !== ".") state.modified += 1;
    } else if (kind === "u") state.conflicts += 1;
    else if (kind === "?") state.untracked += 1;
  }
  if (state.branch === "(detached)") {
    state.detached = true;
    state.branch = oid.slice(0, 7);
  }
  return state;
};

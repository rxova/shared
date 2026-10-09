import type { Worktree } from "../types";

/** A row's pull request as `#12 merged`, or `no PR`. */
export const prLabel = (pr: Worktree["pr"]): string =>
  pr === null ? "no PR" : `#${pr.number} ${pr.state.toLowerCase()}`;

// `[main abc1234] feat: x`, `[main (root-commit) abc1234] …`, `[detached HEAD abc1234] …`: the
// hash is the last word inside the brackets. Bounded by the line, so it stays linear.
const SUMMARY = /^\[[^\]\n]*\s([0-9a-f]{4,40})\]/gm;

/** The hash of the last commit `git commit` reports in its output, or undefined (`-q` prints none). */
export const newCommit = (output: string): string | undefined =>
  [...output.matchAll(SUMMARY)].at(-1)?.[1];

import type { KnipConfig } from "knip";

/**
 * Unused files, exports and dependencies, as a gate rather than a report.
 *
 * The `export` keyword is the point: an export nothing imports still has to be
 * kept working, still shows up in completions, and still reads as part of the
 * contract. Nothing else in this repository notices one.
 *
 * Entry points are inferred from each package's manifest: the exports, and the
 * bin every command is reached from. Nothing needs listing by hand.
 */
export default {
  // Advice nobody has to act on is advice that stops being read.
  treatConfigHintsAsErrors: true,
  // `rxova-repo-config check-exports` runs `attw` from a shell command, where knip cannot see it.
  ignoreDependencies: ["@arethetypeswrong/cli"],
} satisfies KnipConfig;

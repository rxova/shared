import type { Step } from "@/config/config.types";
import { readListFlag } from "@/internal/verify/read-list-flag";

/**
 * The steps named by `--only a,b` (or `--only=a,b`), in the list's order. An
 * unknown name throws: a typo that silently ran nothing would read as a pass.
 */
export const selectSteps = (steps: Step[], argv: readonly string[]): Step[] => {
  const wanted = readListFlag(argv, "--only", "step names");
  if (wanted === undefined) return steps;

  const known = new Set(steps.map((step) => step.name));
  const unknown = wanted.filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new Error(
      `unknown step(s): ${unknown.join(", ")}; the steps are ${[...known].join(", ")}`,
    );
  }
  return steps.filter((step) => wanted.includes(step.name));
};

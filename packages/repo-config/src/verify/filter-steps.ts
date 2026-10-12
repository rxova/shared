import type { Step } from "@/config/config.types";
import { readListFlag } from "@/internal/verify/read-list-flag";

/**
 * `--filter a,b` (or `--filter=a,b`): each `split` step among `steps` runs
 * only in those packages, its command followed by `--filter=a --filter=b`; the
 * other steps run unchanged. The names go into a shell, so anything beyond a
 * package name's characters throws, and so does a filter with no split step
 * to take it, which would otherwise run every package and read as a pass.
 */
export const filterSteps = (steps: Step[], argv: readonly string[]): Step[] => {
  const packages = readListFlag(argv, "--filter", "package names");
  if (packages === undefined) return steps;

  const unsafe = packages.filter((name) => !/^[\w@./!-]+$/.test(name));
  if (unsafe.length > 0) throw new Error(`not a package name: ${unsafe.join(", ")}`);
  if (!steps.some(({ split }) => split !== undefined)) {
    throw new Error("--filter needs a step with `split` among the steps it runs");
  }
  const filter = packages.map((name) => ` --filter=${name}`).join("");
  return steps.map((step) =>
    step.split === undefined ? step : { ...step, command: `${step.command}${filter}` },
  );
};

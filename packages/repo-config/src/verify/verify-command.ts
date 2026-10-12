import { readDryRun } from "@/internal/verify/read-dry-run";
import { runCommand } from "@/internal/verify/run-command";
import type { Reader } from "@/config/config.types";
import type { DryRun, Runner } from "@/verify/verify.types";
import { defaultSteps } from "@/verify/default-steps";
import { filterSteps } from "@/verify/filter-steps";
import { keepGoing } from "@/verify/keep-going";
import { planSteps } from "@/verify/plan-steps";
import { readConfig } from "@/config/read-config";
import { runSteps } from "@/verify/run-steps";
import { selectSteps } from "@/verify/select-steps";
import { wantsPlan } from "@/verify/wants-plan";

/**
 * `rxova-repo-config verify [--only a,b] [--filter a,b] [--keep-going]`: the pre-push gate. The list is
 * `defaultSteps()` unless the root `package.json` names its own under
 * `repoConfig.verify.steps`. `--keep-going` runs every step and lists the
 * failures at the end instead of stopping at the first. `--filter` narrows the
 * `split` steps to some packages.
 *
 * `verify --plan` runs nothing: it prints the gate as a GitHub Actions matrix,
 * one line of `{"include":[{ name, only, filter }]}`, for a fan-out workflow
 * whose jobs each run `verify --only <only> [--filter <filter>]`.
 *
 * Returns the process exit code rather than taking it, so tests can call it.
 */
export const verifyCommand = (
  argv: readonly string[] = process.argv.slice(2),
  {
    root = process.cwd(),
    read,
    run = runCommand,
    dryRun = readDryRun,
  }: { root?: string; read?: Reader; run?: Runner; dryRun?: DryRun } = {},
): number => {
  try {
    const steps = readConfig(root, read).verify?.steps ?? defaultSteps();
    if (wantsPlan(argv)) {
      process.stdout.write(`${JSON.stringify({ include: planSteps(steps, dryRun) })}\n`);
      return 0;
    }
    const selected = filterSteps(selectSteps(steps, argv), argv);
    return runSteps(selected, { run, keepGoing: keepGoing(argv) });
  } catch (failure) {
    process.stderr.write(`verify: ${(failure as Error).message}\n`);
    return 1;
  }
};

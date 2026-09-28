import { renderCoverageSummary } from "@/internal/coverage-summary/render-coverage-summary";
import type { CoverageTotals } from "@/internal/coverage-summary/render-coverage-summary";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * `rxova-repo-config coverage-summary [path]`: the totals of a `json-summary`
 * coverage report (`coverage/coverage-summary.json` by default) as a
 * "## Coverage" block, appended to `GITHUB_STEP_SUMMARY` on GitHub Actions and
 * printed otherwise. No report is not a failure: a job whose tests did not
 * measure coverage has nothing to summarise. Returns the process exit code.
 */
export const coverageSummaryCommand = (
  path = "coverage/coverage-summary.json",
  { env = process.env, root = process.cwd() }: { env?: NodeJS.ProcessEnv; root?: string } = {},
): number => {
  const file = resolve(root, path);
  if (!existsSync(file)) {
    console.log(`coverage-summary: no ${path}, nothing to summarise`);
    return 0;
  }
  try {
    const { total } = JSON.parse(readFileSync(file, "utf8")) as { total?: CoverageTotals };
    if (total === undefined) throw new Error(`${path} has no "total" block`);
    const block = renderCoverageSummary(total);
    if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, block);
    else process.stdout.write(block);
    return 0;
  } catch (failure) {
    console.error(`coverage-summary failed — ${(failure as Error).message}`);
    return 1;
  }
};

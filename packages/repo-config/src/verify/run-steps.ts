import { isReleaseBranch } from "@/internal/verify/is-release-branch";
import { logGroup } from "@/internal/verify/log-group";
import { runCommand } from "@/internal/verify/run-command";
import type { Runner } from "@/verify/verify.types";
import type { Step } from "@/config/config.types";

/**
 * Runs the gate in order and stops at the first failure, because the second
 * failure is usually the first one wearing a different hat. Returns the
 * process exit code.
 *
 * With `keepGoing` every step runs, still in order, and the failures are
 * listed at the end: one CI job then reports everything wrong at once.
 *
 * On the release pull request a step marked `skipOnRelease` is skipped; on
 * GitHub Actions each step's output is folded into its own log group.
 */
export const runSteps = (
  steps: Step[],
  {
    run = runCommand,
    env = process.env,
    keepGoing = false,
  }: { run?: Runner; env?: NodeJS.ProcessEnv; keepGoing?: boolean } = {},
): number => {
  const release = isReleaseBranch(env);
  const fold = env.GITHUB_ACTIONS === "true";
  const failed: Step[] = [];
  for (const [index, step] of steps.entries()) {
    const { name, command, skipOnRelease } = step;
    const title = `verify: [${String(index + 1)}/${String(steps.length)}] ${name}`;
    if (release && skipOnRelease === true) {
      process.stdout.write(`\n${title}: skipped on the release branch\n`);
      continue;
    }
    const passed = logGroup(title, fold, () => {
      try {
        run(command);
        return true;
      } catch {
        return false;
      }
    });
    if (!passed) {
      process.stderr.write(`\nverify: ${name} failed — \`${command}\`\n`);
      if (!keepGoing) return 1;
      failed.push(step);
    }
  }

  if (failed.length > 0) {
    process.stderr.write(
      `\nverify: ${String(failed.length)} of ${String(steps.length)} step(s) failed\n`,
    );
    for (const { name, command } of failed) {
      process.stderr.write(`verify: failed: ${name} — \`${command}\`\n`);
    }
    return 1;
  }
  process.stdout.write("\nverify: all checks passed\n");
  return 0;
};

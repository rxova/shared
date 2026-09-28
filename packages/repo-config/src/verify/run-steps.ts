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
 * On the release pull request a step marked `skipOnRelease` is skipped; on
 * GitHub Actions each step's output is folded into its own log group.
 */
export const runSteps = (
  steps: Step[],
  { run = runCommand, env = process.env }: { run?: Runner; env?: NodeJS.ProcessEnv } = {},
): number => {
  const release = isReleaseBranch(env);
  const fold = env.GITHUB_ACTIONS === "true";
  for (const [index, { name, command, skipOnRelease }] of steps.entries()) {
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
      return 1;
    }
  }

  process.stdout.write("\nverify: all checks passed\n");
  return 0;
};

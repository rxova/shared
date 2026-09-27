import { runCommand } from '@rxova-helpers/verify/run-command';
import type { Runner } from '@/verify/verify.types';
import type { Step } from '@/config/config.types';

/**
 * Runs the gate in order and stops at the first failure, because the second
 * failure is usually the first one wearing a different hat. Returns the
 * process exit code.
 */
export const runSteps = (steps: Step[], { run = runCommand }: { run?: Runner } = {}): number => {
  for (const [index, { name, command }] of steps.entries()) {
    process.stdout.write(`\nverify: [${String(index + 1)}/${String(steps.length)}] ${name}\n`);
    try {
      run(command);
    } catch {
      process.stderr.write(`\nverify: ${name} failed — \`${command}\`\n`);
      return 1;
    }
  }

  process.stdout.write('\nverify: all checks passed\n');
  return 0;
};

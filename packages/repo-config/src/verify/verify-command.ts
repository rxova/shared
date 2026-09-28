import { runCommand } from '@/internal/verify/run-command';
import type { Reader } from '@/config/config.types';
import type { Runner } from '@/verify/verify.types';
import { defaultSteps } from '@/verify/default-steps';
import { readConfig } from '@/config/read-config';
import { runSteps } from '@/verify/run-steps';
import { selectSteps } from '@/verify/select-steps';

/**
 * `rxova-repo-config verify [--only a,b]`: the pre-push gate. The list is
 * `defaultSteps()` unless the root `package.json` names its own under
 * `tooling.verify.steps`. Returns the process exit code rather than taking it,
 * so tests can call it.
 */
export const verifyCommand = (
  argv: readonly string[] = process.argv.slice(2),
  {
    root = process.cwd(),
    read,
    run = runCommand,
  }: { root?: string; read?: Reader; run?: Runner } = {},
): number => {
  try {
    const steps = readConfig(root, read).verify?.steps ?? defaultSteps();
    return runSteps(selectSteps(steps, argv), { run });
  } catch (failure) {
    process.stderr.write(`verify: ${(failure as Error).message}\n`);
    return 1;
  }
};

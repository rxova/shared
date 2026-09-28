import { spawnSync } from 'node:child_process';
import type { Shell } from '@/pack-smoke/pack-smoke.types';

/**
 * Runs a command in `cwd` and returns stdout and stderr together, since a CLI
 * may print its help to either; throws with that output when it exits non-zero.
 * On Windows it goes through the shell, which is how `npx` resolves there.
 */
export const captureOutput: Shell = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  const output = `${result.stdout}${result.stderr}`;
  if (result.status !== 0) {
    throw new Error(
      `\`${[command, ...args].join(' ')}\` exited with ${String(result.status)}:\n${output}`,
    );
  }
  return output;
};

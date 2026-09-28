import { readFile } from '@/internal/config/read-file';
import { runCommand } from '@/internal/verify/run-command';
import type { Reader } from '@/config/config.types';
import type { Runner } from '@/verify/verify.types';
import { readPackageConfig } from '@/config/read-package-config';

/**
 * `rxova-repo-config check-exports [--profile <p>]`: the package in the
 * working directory resolves the way its manifest promises — `publint
 * --strict`, then `attw --pack .` with the profile from the flag or the
 * package's `repoConfig.exports.profile` (`esm-only`, `node16`, …). Run it as
 * the package's `check:exports` script, after a build; `publint` and
 * `@arethetypeswrong/cli` must be installed. Returns the process exit code.
 */
export const checkExportsCommand = (
  argv: readonly string[] = [],
  {
    cwd = process.cwd(),
    run = runCommand,
    read = readFile,
  }: { cwd?: string; run?: Runner; read?: Reader } = {},
): number => {
  try {
    const flag = argv.find((arg) => arg === '--profile' || arg.startsWith('--profile='));
    const fromFlag = flag?.includes('=')
      ? flag.slice(flag.indexOf('=') + 1)
      : flag && argv[argv.indexOf(flag) + 1];
    const profile =
      flag === undefined ? readPackageConfig(cwd, read).exports?.profile : (fromFlag ?? '');
    if (profile !== undefined && !/^[a-z][a-z0-9-]*$/.test(profile)) {
      throw new Error(`--profile needs an attw profile name such as esm-only, found "${profile}"`);
    }
    run('publint --strict');
    run(`attw --pack .${profile === undefined ? '' : ` --profile ${profile}`}`);
    return 0;
  } catch (failure) {
    console.error(`check-exports failed — ${(failure as Error).message}`);
    return 1;
  }
};

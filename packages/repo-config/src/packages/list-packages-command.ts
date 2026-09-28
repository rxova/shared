import { listedPackages } from '@/internal/packages/listed-packages';
import { appendFileSync } from 'node:fs';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config list-packages [--marker <dotted.key>] [--github-output]`:
 * the packages a CI matrix runs over, discovered from the manifests rather
 * than listed in a workflow that drifts. Prints `dirs=<json array>` (for
 * `fromJSON` in a matrix) and `dirs_list=<space-separated>` (for a shell
 * loop) — appended to `GITHUB_OUTPUT` with `--github-output`. Without a
 * marker (flag or `repoConfig.packages.marker`) the list is the published
 * packages. Reads manifests only, so it is fast. Returns the process exit code.
 */
export const listPackagesCommand = (
  argv: readonly string[] = [],
  { root = process.cwd(), env = process.env }: { root?: string; env?: NodeJS.ProcessEnv } = {},
): number => {
  try {
    const flag = argv.find((arg) => arg === '--marker' || arg.startsWith('--marker='));
    const fromFlag = flag?.includes('=')
      ? flag.slice(flag.indexOf('=') + 1)
      : flag && argv[argv.indexOf(flag) + 1];
    if (flag !== undefined && !fromFlag) throw new Error('--marker needs a dotted manifest key');
    const marker = fromFlag ?? readConfig(root).packages?.marker;
    const dirs = listedPackages(root, marker).map(({ dir }) => dir);
    const lines = `dirs=${JSON.stringify(dirs)}\ndirs_list=${dirs.join(' ')}\n`;
    if (argv.includes('--github-output')) {
      if (!env.GITHUB_OUTPUT) throw new Error('--github-output needs GITHUB_OUTPUT to be set');
      appendFileSync(env.GITHUB_OUTPUT, lines);
    } else {
      process.stdout.write(lines);
    }
    return 0;
  } catch (failure) {
    console.error(`list-packages failed — ${(failure as Error).message}`);
    return 1;
  }
};

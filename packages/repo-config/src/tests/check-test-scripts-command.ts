import { expandDirs } from '@/internal/files/expand-dirs';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PackageManifest } from '@/manifest/manifest.types';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config check-test-scripts`: every workspace with a
 * `vitest.config.*` has a `test` script. Turbo runs only the suites it knows
 * about, so a package whose script is missing ships untested while every job
 * stays green. The workspaces are `repoConfig.testScripts.globs`
 * (`packages/*`, `apps/*`). Returns the process exit code.
 */
export const checkTestScriptsCommand = ({
  root = process.cwd(),
}: { root?: string } = {}): number => {
  try {
    const { globs = ['packages/*', 'apps/*'] } = readConfig(root).testScripts ?? {};
    const suites = expandDirs(root, globs).filter((dir) =>
      readdirSync(join(root, dir)).some((file) => /^vitest\.config\.[cm]?[jt]s$/.test(file)),
    );
    const missing = suites.filter((dir) => {
      const manifest = join(root, dir, 'package.json');
      if (!existsSync(manifest)) return true;
      return (
        (JSON.parse(readFileSync(manifest, 'utf8')) as PackageManifest).scripts?.test === undefined
      );
    });
    if (missing.length > 0) {
      console.error(
        [
          'check-test-scripts: these workspaces have a vitest config but no `test` script, so no task runs them:',
          ...missing.map((dir) => `  ${dir}`),
        ].join('\n'),
      );
      return 1;
    }
    console.log(
      `check-test-scripts: ${String(suites.length)} test suite(s), each with a test script`,
    );
    return 0;
  } catch (failure) {
    console.error(`check-test-scripts failed — ${(failure as Error).message}`);
    return 1;
  }
};

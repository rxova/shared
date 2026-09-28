import { collectLlmsFailures } from '@/internal/llms/collect-llms-failures';
import { formatLlmsFailures } from '@/internal/llms/format-llms-failures';
import { resolve } from 'node:path';

/**
 * `rxova-repo-config check-llms [root]`: fails when a published package's
 * `llms.txt` is missing, left out of the tarball, malformed, or out of step
 * with the package's exports.
 *
 * The file ships in the tarball, so it is what a coding agent reads out of
 * `node_modules` after an install. A renamed export leaves it describing an API
 * that no longer exists while every test still passes, and nothing else in the
 * repo reads it. So the check that matters is the last one: the `## API` table
 * and `src/index.ts` name the same exports, in both directions. The root
 * `llms.txt` must link every package's file. Reads files only: no build, no
 * network.
 */
export const checkLlmsCommand = (root: string = process.cwd()): number => {
  const failures = collectLlmsFailures(resolve(root));
  if (failures.length > 0) {
    console.error(formatLlmsFailures(failures));
    return 1;
  }

  console.log('check:llms ok — every published llms.txt matches its exports and is in the index');
  return 0;
};

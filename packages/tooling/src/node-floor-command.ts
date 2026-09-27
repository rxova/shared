import { workspaceFiles } from '@rxova/helpers';
import type { WorkspaceFiles } from './node-floor.types.js';
import { appendFileSync } from 'node:fs';
import { decideFloor } from './decide-floor.js';
import { readPublished } from './read-published.js';

/**
 * `rxova-tooling node-floor`: the oldest Node the published packages promise to
 * run on, for the CI job that installs each packed tarball on exactly that
 * Node. The unit matrix runs the newest release of each major, which proves
 * little about the floor: `>=22.13` is a promise about 22.13. Reading it from
 * the manifests keeps the job and the promise from drifting apart. Writes
 * `version` and `packages` to `GITHUB_OUTPUT` when set.
 */
export const nodeFloorCommand = (
  root: string = process.cwd(),
  env: NodeJS.ProcessEnv = process.env,
  { fs = workspaceFiles }: { fs?: WorkspaceFiles } = {},
): number => {
  try {
    const published = readPublished(root, fs);
    const floor = decideFloor(published);

    console.log(
      floor === undefined
        ? 'node-floor: no published package, nothing to test'
        : `node-floor: ${floor} for ${published.map((pkg) => pkg.name).join(', ')}`,
    );

    if (env.GITHUB_OUTPUT) {
      const dirs = published.map((pkg) => pkg.dir).join(' ');
      appendFileSync(env.GITHUB_OUTPUT, `version=${floor ?? ''}\npackages=${dirs}\n`);
    }
    return 0;
  } catch (failure) {
    console.error(`node-floor failed — ${(failure as Error).message}`);
    return 1;
  }
};

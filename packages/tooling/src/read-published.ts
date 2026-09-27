import { workspaceFiles } from '@rxova/helpers';
import type { PackageManifest } from './manifest.types.js';
import type { Published, WorkspaceFiles } from './node-floor.types.js';
import { join } from 'node:path';
import { floorOf } from './floor-of.js';

/** Every non-private package under `packages/`, with the Node floor its `engines` declares. */
export const readPublished = (root: string, fs: WorkspaceFiles = workspaceFiles): Published[] =>
  fs.list(join(root, 'packages')).flatMap((entry) => {
    const dir = `packages/${entry}`;
    const raw = fs.read(join(root, dir, 'package.json'));
    if (raw === undefined) return [];

    const manifest = JSON.parse(raw) as PackageManifest;
    if (manifest.private === true) return [];

    const name = manifest.name ?? dir;
    const range = manifest.engines?.node;
    if (range === undefined) {
      throw new Error(`${name} is published but declares no engines.node`);
    }
    const floor = floorOf(range);
    if (floor === undefined) {
      throw new Error(`${name}: engines.node "${range}" is not a plain lower bound like ">=22.13"`);
    }
    return [{ dir, name, floor }];
  });

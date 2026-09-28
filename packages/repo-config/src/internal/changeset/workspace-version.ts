import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Reader } from '@/config/config.types';
import type { PackageManifest } from '@/manifest/manifest.types';

/** The version of the workspace package called `name` under `roots`; throws when there is none. */
export const workspaceVersion = (
  root: string,
  name: string,
  read: Reader,
  roots: readonly string[] = ['packages', 'apps'],
): string => {
  for (const top of roots) {
    const dir = join(root, top);
    if (!existsSync(dir)) continue;
    for (const entry of readdirSync(dir)) {
      const text = read(join(dir, entry, 'package.json'));
      if (text === undefined) continue;
      const manifest = JSON.parse(text) as PackageManifest;
      if (manifest.name !== name) continue;
      if (manifest.version === undefined) throw new Error(`${name} has no version`);
      return manifest.version;
    }
  }
  throw new Error(`no workspace package named ${name} under ${roots.join(', ')}`);
};

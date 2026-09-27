import { join } from 'node:path';
import type { PackageManifest } from '@rxova-tooling/manifest/manifest.types';
import type { ScratchFiles } from '@rxova-tooling/pack-smoke/pack-smoke.types';

/** The directory beside `pkgDir` holding the workspace package `name`. */
export const workspaceDir = (pkgDir: string, name: string, fs: ScratchFiles): string => {
  const parent = join(pkgDir, '..');
  for (const dir of fs.list(parent)) {
    try {
      const { name: found } = JSON.parse(
        fs.read(join(parent, dir, 'package.json')),
      ) as PackageManifest;
      if (found === name) return join(parent, dir);
    } catch {
      // Not a package: no manifest, or not JSON.
    }
  }
  throw new Error(`no workspace package named ${name} beside ${pkgDir}`);
};

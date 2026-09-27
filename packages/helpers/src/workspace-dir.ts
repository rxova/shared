import { join } from 'node:path';
import type { PackageManifest } from '../../tooling/src/manifest.types.ts';
import type { ScratchFiles } from '../../tooling/src/pack-smoke.types.ts';

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

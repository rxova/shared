import { join } from 'node:path';
import type { PackageManifest } from '../../tooling/src/manifest.types.ts';
import { packInto } from './pack-into.ts';
import type { ScratchFiles, Shell } from '../../tooling/src/pack-smoke.types.ts';
import { workspaceDir } from './workspace-dir.ts';

/**
 * `npm pack` keeps a `workspace:` dependency as written, which no npm install
 * resolves. So each one is packed too, and `tarball` is repacked with those
 * dependencies pointing at their tarballs: what `pnpm publish` does with the
 * published versions, done with npm alone. A package without one is left alone.
 */
export const resolveWorkspaceDeps = (
  pkgDir: string,
  manifest: PackageManifest,
  tarball: string,
  scratch: string,
  { sh, fs }: { sh: Shell; fs: ScratchFiles },
): void => {
  const local = Object.entries(manifest.dependencies ?? {}).filter(([, spec]) =>
    spec.startsWith('workspace:'),
  );
  if (local.length === 0) return;
  sh('tar', ['-xzf', tarball, '-C', scratch], scratch);
  const unpacked = join(scratch, 'package');
  const packed = JSON.parse(fs.read(join(unpacked, 'package.json'))) as PackageManifest;
  const dependencies = { ...packed.dependencies };
  for (const [name] of local) {
    dependencies[name] = `file:${packInto(workspaceDir(pkgDir, name, fs), scratch, sh)}`;
  }
  fs.write(join(unpacked, 'package.json'), JSON.stringify({ ...packed, dependencies }, null, 2));
  sh('npm', ['pack', '--ignore-scripts', '--pack-destination', scratch], unpacked);
};

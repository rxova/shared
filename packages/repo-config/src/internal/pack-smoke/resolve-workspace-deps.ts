import { join } from 'node:path';
import type { PackageManifest } from '@/manifest/manifest.types';
import { packInto } from '@/internal/pack-smoke/pack-into';
import { publishedRange } from '@/internal/pack-smoke/published-range';
import type { ScratchFiles, Shell } from '@/pack-smoke/pack-smoke.types';
import { workspaceDir } from '@/internal/pack-smoke/workspace-dir';

/**
 * `npm pack` keeps a `workspace:` spec as written, which no npm install
 * resolves. So each workspace package the tarball names is packed too, and
 * `tarball` is repacked the way `pnpm publish` would have written it, with
 * npm alone:
 *
 * - in `dependencies` and `optionalDependencies`, the spec points at the
 *   workspace package's tarball;
 * - in `peerDependencies`, it becomes the range pnpm publishes (`^1.2.0` for
 *   `workspace:^`), and the workspace package's tarball is returned so the
 *   caller installs it beside the package, the way a consumer provides a peer.
 *
 * `devDependencies` are left as written: npm never installs a dependency's
 * dev dependencies. A package with no `workspace:` spec is left alone, and
 * nothing is returned.
 */
export const resolveWorkspaceDeps = (
  pkgDir: string,
  manifest: PackageManifest,
  tarball: string,
  scratch: string,
  { sh, fs }: { sh: Shell; fs: ScratchFiles },
): string[] => {
  const fields = ['dependencies', 'optionalDependencies', 'peerDependencies'] as const;
  const names = new Set(
    fields.flatMap((field) =>
      Object.entries(manifest[field] ?? {})
        .filter(([, spec]) => spec.startsWith('workspace:'))
        .map(([name]) => name),
    ),
  );
  if (names.size === 0) return [];
  sh('tar', ['-xzf', tarball, '-C', scratch], scratch);
  const unpacked = join(scratch, 'package');
  const packed = JSON.parse(fs.read(join(unpacked, 'package.json'))) as PackageManifest;
  const local = new Map(
    [...names].map((name) => {
      const dir = workspaceDir(pkgDir, name, fs);
      const { version } = JSON.parse(fs.read(join(dir, 'package.json'))) as PackageManifest;
      return [name, { tarball: packInto(dir, scratch, sh), version }] as const;
    }),
  );
  interface Local {
    tarball: string;
    version: string | undefined;
  }
  const rewrite = (
    specs: Record<string, string> | undefined,
    to: (spec: string, found: Local) => string,
  ): Record<string, string> | undefined =>
    specs &&
    Object.fromEntries(
      Object.entries(specs).map(([name, spec]) => {
        const found = spec.startsWith('workspace:') ? local.get(name) : undefined;
        return [name, found ? to(spec, found) : spec];
      }),
    );
  const toTarball = (_: string, { tarball: file }: Local) => `file:${file}`;
  // Undefined fields drop out of the JSON, as they were absent from it.
  const resolved: Record<string, unknown> = {
    ...packed,
    dependencies: rewrite(packed.dependencies, toTarball),
    optionalDependencies: rewrite(packed.optionalDependencies, toTarball),
    peerDependencies: rewrite(packed.peerDependencies, (spec, { version }) =>
      publishedRange(spec, version),
    ),
  };
  fs.write(join(unpacked, 'package.json'), JSON.stringify(resolved, null, 2));
  sh('npm', ['pack', '--ignore-scripts', '--pack-destination', scratch], unpacked);
  const peers = Object.entries(manifest.peerDependencies ?? {});
  return [...local]
    .filter(([name]) =>
      peers.some(([peer, spec]) => peer === name && spec.startsWith('workspace:')),
    )
    .map(([, { tarball: file }]) => file);
};

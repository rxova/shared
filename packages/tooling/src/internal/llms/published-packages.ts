import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { PublishedPackage } from '@/internal/llms/llms.types';
import type { PackageManifest } from '@/manifest/manifest.types';

/** Every package under `packages/` that is not private, and so publishes a tarball. */
export const publishedPackages = (root: string): PublishedPackage[] => {
  const packagesDir = join(root, 'packages');
  if (!existsSync(packagesDir)) return [];

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({ dir: entry.name, path: join(packagesDir, entry.name, 'package.json') }))
    .filter(({ path }) => existsSync(path))
    .map(({ dir, path }) => ({
      dir,
      manifest: JSON.parse(readFileSync(path, 'utf8')) as PackageManifest,
    }))
    .filter(({ manifest }) => manifest.private !== true)
    .map(({ dir, manifest }) => ({ dir, name: manifest.name ?? dir, files: manifest.files ?? [] }));
};

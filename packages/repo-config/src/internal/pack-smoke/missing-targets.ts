import type { PackageManifest } from '@/manifest/manifest.types';
import { exportTargets } from '@/internal/pack-smoke/export-targets';

/**
 * The manifest's targets (see `exportTargets`) the tarball does not hold: a
 * `.d.cts` or `.cjs` the build stopped emitting, say, which a `require` or a
 * type checker only finds once the package is published. A subpath pattern
 * needs at least one file it matches.
 */
export const missingTargets = (manifest: PackageManifest, contents: readonly string[]): string[] =>
  exportTargets(manifest).filter((target) => {
    if (!target.includes('*')) return !contents.includes(target);
    const escaped = target.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replaceAll('*', '.+');
    const pattern = new RegExp(`^${escaped}$`);
    return !contents.some((path) => pattern.test(path));
  });

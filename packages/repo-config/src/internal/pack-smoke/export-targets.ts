import type { PackageManifest } from '@/manifest/manifest.types';
import { exportLeaves } from '@/internal/pack-smoke/export-leaves';

/**
 * The files a manifest points a consumer at — every target in `exports`, plus
 * `main`, `module`, `types`, `typings` and each bin — as paths inside the
 * package, without the leading `./`. A target with a `*` is a subpath pattern,
 * kept as written. Each appears once.
 */
export const exportTargets = (manifest: PackageManifest): string[] => {
  const bins =
    typeof manifest.bin === 'string' ? [manifest.bin] : Object.values(manifest.bin ?? {});
  const targets = [
    ...exportLeaves(manifest.exports),
    manifest.main,
    manifest.module,
    manifest.types,
    manifest.typings,
    ...bins,
  ]
    .filter((target): target is string => typeof target === 'string' && target !== '')
    .map((target) => target.replace(/^\.?\/+/, ''));
  return [...new Set(targets)];
};

import { isRecord } from '@/internal/config/is-record';
import { exportLeaves } from '@/internal/pack-smoke/export-leaves';
import type { PackageManifest } from '@/manifest/manifest.types';

/**
 * The specifiers the import/require probe loads. The package name, unless its
 * exports map lists subpaths only: then each subpath without a `*` whose
 * target is JavaScript (a stylesheet or a JSON file does not import in plain
 * Node). A package exporting only `./transforms/*`, say, has nothing to probe.
 */
export const probeTargets = (manifest: PackageManifest): string[] => {
  const name = manifest.name ?? '';
  const { exports } = manifest;
  if (!isRecord(exports)) return [name];
  const subpaths = Object.keys(exports).filter((key) => key.startsWith('.'));
  if (subpaths.length === 0 || subpaths.includes('.')) return [name];
  return subpaths
    .filter(
      (key) =>
        !key.includes('*') &&
        key !== './package.json' &&
        exportLeaves(exports[key]).some((leaf) => /\.[cm]?js$/.test(leaf)),
    )
    .map((key) => `${name}/${key.slice(2)}`);
};

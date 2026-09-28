import { join } from 'node:path';
import type { Reader } from '@/config/config.types';
import { isShippedPath } from '@/internal/changeset/is-shipped-path';
import type { PackageManifest } from '@/manifest/manifest.types';

/**
 * The paths in `changed` (relative to the repository root) that a published
 * package ships: its README and `llms.txt` as much as its code. `published`
 * holds directory names under `packages/`. A package whose manifest is gone —
 * deleted in this range, say — ships nothing any more.
 */
export const shippedChanges = (
  changed: readonly string[],
  published: readonly string[],
  root: string,
  read: Reader,
): string[] => {
  const files = new Map(
    published.flatMap((dir) => {
      const manifest = read(join(root, 'packages', dir, 'package.json'));
      if (manifest === undefined) return [];
      return [[dir, (JSON.parse(manifest) as PackageManifest).files ?? []] as const];
    }),
  );

  return changed.filter((file) => {
    const [top, dir = '', ...rest] = file.split('/');
    const shipped = files.get(dir);
    return top === 'packages' && shipped !== undefined && isShippedPath(rest.join('/'), shipped);
  });
};

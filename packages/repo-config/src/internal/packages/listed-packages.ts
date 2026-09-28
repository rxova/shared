import { packageManifests } from '@/internal/packages/package-manifests';
import { readDotted } from '@/internal/packages/read-dotted';

/**
 * The packages `list-packages` prints: with a `marker` (a dotted manifest key
 * such as `rxova.slug`), every package whose manifest sets it, private or not;
 * without one, every published package. Sorted by what a reader sees — the
 * manifest's `rxova.label`, else the marker's value, else the name — so the
 * order needs no list of its own.
 */
export const listedPackages = (root: string, marker?: string): { dir: string; name: string }[] =>
  packageManifests(root, { published: marker === undefined })
    .flatMap(({ dir, manifest }) => {
      const mark = marker === undefined ? dir : readDotted(manifest, marker);
      if ([undefined, null, false, ''].includes(mark as never)) return [];
      const label = readDotted(manifest, 'rxova.label');
      const name = manifest.name ?? dir;
      const key =
        typeof label === 'string'
          ? label
          : marker !== undefined && typeof mark === 'string'
            ? mark
            : name;
      return [{ dir, name, key }];
    })
    .sort(
      (a, b) =>
        a.key.localeCompare(b.key, undefined, { sensitivity: 'base' }) ||
        a.dir.localeCompare(b.dir),
    )
    .map(({ dir, name }) => ({ dir, name }));

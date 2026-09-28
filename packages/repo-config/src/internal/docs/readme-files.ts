import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { packageManifests } from '@/internal/packages/package-manifests';

/** The root README and each package's, as paths relative to `root`: shipped documentation too. */
export const readmeFiles = (root: string): string[] =>
  ['README.md', ...packageManifests(root).map(({ dir }) => `packages/${dir}/README.md`)].filter(
    (path) => existsSync(join(root, path)),
  );

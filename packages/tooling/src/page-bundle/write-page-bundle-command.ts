import { PAGE_BUNDLE_FILENAME } from '@/internal/page-bundle/page-bundle-filename';
import { writeFile } from '@/internal/page-bundle/write-file';
import type { Writer } from '@/page-bundle/page-bundle.types';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pageBundleManifest } from '@/page-bundle/page-bundle-manifest';

/**
 * `rxova-tooling write-page-bundle <dist> <project> <base>`: marks a built docs
 * dist as a page-component bundle for the rxova.org aggregator, e.g.
 * `rxova-tooling write-page-bundle apps/docs/dist overlock /packages/overlock/`.
 */
export const writePageBundleCommand = (
  argv: readonly string[] = process.argv.slice(2),
  {
    write = writeFile,
    exists = existsSync,
  }: { write?: Writer; exists?: (path: string) => boolean } = {},
): number => {
  const [dist, project, base] = argv;
  if (dist === undefined || project === undefined || base === undefined) {
    console.error('usage: rxova-tooling write-page-bundle <dist> <project> <base>');
    return 1;
  }
  try {
    if (!exists(dist)) throw new Error(`${dist} does not exist; build the docs first`);
    const file = join(dist, PAGE_BUNDLE_FILENAME);
    write(file, `${JSON.stringify(pageBundleManifest(project, base), null, 2)}\n`);
    console.log(`write-page-bundle: wrote ${file}`);
    return 0;
  } catch (failure) {
    console.error(`write-page-bundle failed — ${(failure as Error).message}`);
    return 1;
  }
};

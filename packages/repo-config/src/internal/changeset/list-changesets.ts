import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { changesetFiles } from '@/internal/changeset/changeset-files';

/** Every changeset waiting in `<root>/.changeset`, as `.changeset/<file>.md`, sorted. */
export const listChangesets = (root: string): string[] => {
  const dir = join(root, '.changeset');
  if (!existsSync(dir)) return [];
  return changesetFiles(readdirSync(dir).map((file) => `.changeset/${file}`)).sort();
};

import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Every file under `dir`, as a `/`-separated path relative to it, sorted.
 * `node_modules` and dot-directories are skipped; a missing `dir` has none.
 */
export const walkFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).replaceAll('\\', '/'))
    .filter(
      (path) => !path.split('/').some((part) => part === 'node_modules' || part.startsWith('.')),
    )
    .sort();
};

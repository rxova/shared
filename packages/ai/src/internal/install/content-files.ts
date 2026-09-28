import { readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/** Every file under `dir`, as `/`-separated paths relative to it, sorted. */
export const contentFiles = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)).split(sep).join('/'))
    .sort();

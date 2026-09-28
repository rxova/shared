import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The entry files of the package at `pkgDir` that exist: `src/index.ts`, and
 * with `subpaths` also every `src/<dir>/index.ts` — the source of a subpath
 * export like `use-everywhere/devtools`, read off the tree rather than the
 * exports map, which points at a `dist` a clean checkout does not have.
 */
export const entryFiles = (pkgDir: string, mode: 'index' | 'subpaths' = 'index'): string[] => {
  const src = join(pkgDir, 'src');
  const subpaths =
    mode === 'subpaths' && existsSync(src)
      ? readdirSync(src, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => join(src, entry.name, 'index.ts'))
          .sort()
      : [];
  return [join(src, 'index.ts'), ...subpaths].filter((file) => existsSync(file));
};

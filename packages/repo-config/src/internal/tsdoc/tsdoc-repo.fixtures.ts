import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const made: string[] = [];

/** Removes every repository `tsdocRepo` made. Register it with `afterAll`. */
export const cleanupTsdocRepos = (): void => {
  for (const dir of made.splice(0)) rmSync(dir, { recursive: true, force: true });
};

/** A throwaway repository holding `files` (path to contents; objects are written as JSON). */
export const tsdocRepo = (files: Record<string, string | object>): string => {
  const root = mkdtempSync(join(tmpdir(), 'check-tsdoc-'));
  made.push(root);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(
      join(root, path),
      typeof contents === 'string' ? contents : JSON.stringify(contents),
    );
  }
  return root;
};

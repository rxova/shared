import { readdirSync, rmdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { fromTarget } from '@/internal/install/from-target';

/**
 * Removes the target-relative files, then each directory they leave empty, up to (not
 * including) the target itself.
 */
export const removeFiles = (target: string, files: readonly string[]): void => {
  for (const file of files) rmSync(fromTarget(target, file), { force: true });
  const dirs = new Set(files.map((file) => dirname(fromTarget(target, file))));
  for (const start of [...dirs].sort((a, b) => b.length - a.length)) {
    let dir = start;
    while (dir.startsWith(target) && dir !== target) {
      try {
        if (readdirSync(dir).length > 0) break;
        rmdirSync(dir);
      } catch {
        break;
      }
      dir = dirname(dir);
    }
  }
};

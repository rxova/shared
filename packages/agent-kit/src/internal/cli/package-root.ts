import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The directory holding this package's `package.json`, found by walking up from a module:
 * `dist/` when installed, `src/**` in the repository. `content/` sits beside it either way.
 */
export const packageRoot = (from: string): string => {
  let dir = dirname(fileURLToPath(from));
  for (;;) {
    if (existsSync(join(dir, 'package.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error('rxova-agent-kit: no package.json above this module');
    dir = parent;
  }
};

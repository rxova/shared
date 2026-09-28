import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The version in the `package.json` of `dir`. */
export const packageVersionAt = (dir: string): string =>
  (JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { version: string }).version;

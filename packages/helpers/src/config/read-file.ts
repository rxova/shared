import { existsSync, readFileSync } from 'node:fs';
import type { Reader } from '@rxova-tooling/config/config.types';

/** Reads a UTF-8 file, or nothing when it is missing. */
export const readFile: Reader = (file) =>
  existsSync(file) ? readFileSync(file, 'utf8') : undefined;

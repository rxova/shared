import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

/** Writes a value as two-space JSON with a trailing newline, creating the directory. */
export const writeJson = (path: string, value: unknown): void => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
};

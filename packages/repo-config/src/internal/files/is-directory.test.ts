import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isDirectory } from '@/internal/files/is-directory';

describe('isDirectory', () => {
  it('tells directories from files and missing paths', () => {
    expect(isDirectory(tmpdir())).toBe(true);
    expect(isDirectory(fileURLToPath(import.meta.url))).toBe(false);
    expect(isDirectory(join(tmpdir(), 'no-such-dir-at-all'))).toBe(false);
  });
});

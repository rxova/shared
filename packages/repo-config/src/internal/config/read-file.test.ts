import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readFile } from '@/internal/config/read-file';

describe('readFile', () => {
  it('reads a file, or nothing when it is missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'read-file-'));
    try {
      writeFileSync(join(dir, 'a.txt'), 'hi');
      expect(readFile(join(dir, 'a.txt'))).toBe('hi');
      expect(readFile(join(dir, 'missing.txt'))).toBeUndefined();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

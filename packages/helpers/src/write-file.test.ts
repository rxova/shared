import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { writeFile } from './write-file.ts';

describe('writeFile', () => {
  it('writes to disk', () => {
    const dir = mkdtempSync(join(tmpdir(), 'write-file-'));
    try {
      writeFile(join(dir, 'a.json'), '{}');
      expect(readFileSync(join(dir, 'a.json'), 'utf8')).toBe('{}');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

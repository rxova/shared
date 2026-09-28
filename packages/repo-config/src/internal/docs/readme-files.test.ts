import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readmeFiles } from '@/internal/docs/readme-files';

describe('readmeFiles', () => {
  it('lists the READMEs that exist', () => {
    const root = mkdtempSync(join(tmpdir(), 'readme-files-'));
    try {
      expect(readmeFiles(root)).toEqual([]);
      for (const dir of ['a', 'b']) {
        mkdirSync(join(root, 'packages', dir), { recursive: true });
        writeFileSync(join(root, 'packages', dir, 'package.json'), '{}');
      }
      writeFileSync(join(root, 'README.md'), '');
      writeFileSync(join(root, 'packages', 'b', 'README.md'), '');
      expect(readmeFiles(root)).toEqual(['README.md', 'packages/b/README.md']);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

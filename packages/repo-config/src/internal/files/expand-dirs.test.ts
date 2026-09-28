import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { expandDirs } from '@/internal/files/expand-dirs';

const root = mkdtempSync(join(tmpdir(), 'expand-dirs-'));
for (const dir of ['packages/a', 'packages/b', 'apps/docs', 'tools'])
  mkdirSync(join(root, dir), { recursive: true });
writeFileSync(join(root, 'packages', 'file.txt'), '');

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('expandDirs', () => {
  it('expands a trailing glob segment to directories, and keeps literal ones', () => {
    expect(
      expandDirs(root, ['packages/*', './apps/*/', 'tools', 'missing', 'nope/*', 'packages/a']),
    ).toEqual(['apps/docs', 'packages/a', 'packages/b', 'tools']);
    expect(expandDirs(root, ['*'])).toEqual(['apps', 'packages', 'tools']);
  });
});

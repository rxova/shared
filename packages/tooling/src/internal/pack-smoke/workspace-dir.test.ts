import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { memoryScratch, PARENT } from '@/internal/pack-smoke/memory-scratch.fixtures';
import { workspaceDir } from '@/internal/pack-smoke/workspace-dir';

describe('workspaceDir', () => {
  it('finds the sibling package by name, skipping directories that are not packages', () => {
    const { fs } = memoryScratch(
      { name: 'x', version: '1.0.0' },
      {
        extra: {
          [join('/', 'config', 'package.json')]: 'not json',
          [join('/', 'core', 'package.json')]: JSON.stringify({ name: '@scope/core' }),
        },
      },
    );
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ['config', 'core', 'pkg', 'empty'] : listed(dir));
    expect(workspaceDir('/pkg', '@scope/core', fs)).toBe(join(PARENT, 'core'));
  });

  it('throws when no sibling has that name', () => {
    const { fs } = memoryScratch({ name: 'x', version: '1.0.0' });
    fs.list = () => [];
    expect(() => workspaceDir('/pkg', 'y', fs)).toThrow('no workspace package named y beside /pkg');
  });
});

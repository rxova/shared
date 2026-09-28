import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { gitLsFiles } from '@/internal/size/git-ls-files';

describe('gitLsFiles', () => {
  it('lists the tracked files of this repository', () => {
    const root = fileURLToPath(new URL('../../../../../', import.meta.url));
    expect(gitLsFiles(root)).toContain('package.json');
  });
});

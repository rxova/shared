import { describe, expect, it } from 'vitest';
import { gitDiffPatch } from './git-diff-patch.ts';

describe('gitDiffPatch', () => {
  it('is empty for an empty range', () => {
    expect(gitDiffPatch('HEAD', 'HEAD', 'package.json')).toBe('');
  });
});

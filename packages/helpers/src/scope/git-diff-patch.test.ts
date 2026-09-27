import { describe, expect, it } from 'vitest';
import { gitDiffPatch } from '@rxova-helpers/scope/git-diff-patch';

describe('gitDiffPatch', () => {
  it('is empty for an empty range', () => {
    expect(gitDiffPatch('HEAD', 'HEAD', 'package.json')).toBe('');
  });
});

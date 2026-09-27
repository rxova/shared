import { describe, expect, it } from 'vitest';
import { gitDiffNames } from './git-diff-names.ts';

describe('gitDiffNames', () => {
  it('lists the files an empty range changed — none', () => {
    expect(gitDiffNames('HEAD', 'HEAD')).toEqual([]);
  });
});

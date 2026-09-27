import { describe, expect, it } from 'vitest';
import { gitReader } from '@rxova-helpers/scope/git-reader';

describe('gitReader', () => {
  it('runs git for real', () => {
    expect(gitReader.names('HEAD', 'HEAD')).toEqual([]);
    expect(gitReader.patch('HEAD', 'HEAD', 'package.json')).toBe('');
  });
});

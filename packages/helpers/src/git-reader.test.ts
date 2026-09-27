import { describe, expect, it } from 'vitest';
import { gitReader } from './git-reader.ts';

describe('gitReader', () => {
  it('runs git for real', () => {
    expect(gitReader.names('HEAD', 'HEAD')).toEqual([]);
    expect(gitReader.patch('HEAD', 'HEAD', 'package.json')).toBe('');
  });
});

import { describe, expect, it } from 'vitest';
import { git } from './git.ts';

describe('git', () => {
  it('runs git for real', () => {
    expect(git('rev-parse', '--is-inside-work-tree').trim()).toBe('true');
  });
});

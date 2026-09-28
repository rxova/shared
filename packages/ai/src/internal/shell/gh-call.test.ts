import { describe, expect, it } from 'vitest';
import { ghCall } from '@/internal/shell/gh-call';

describe('ghCall', () => {
  it('splits the command words from the options', () => {
    expect(ghCall(['GH_HOST=x', 'gh', 'pr', 'create', '--title', 't'])).toEqual({
      command: ['pr', 'create'],
      args: ['--title', 't'],
    });
  });

  it('takes every word as the command when there are no options', () => {
    expect(ghCall(['gh', 'pr', 'list'])).toEqual({ command: ['pr', 'list'], args: [] });
  });

  it('is undefined for another program, or nothing at all', () => {
    expect(ghCall(['git', 'pr'])).toBeUndefined();
    expect(ghCall(['A=1'])).toBeUndefined();
  });
});

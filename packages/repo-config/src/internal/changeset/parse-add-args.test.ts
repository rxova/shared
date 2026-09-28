import { describe, expect, it } from 'vitest';
import { parseAddArgs } from '@/internal/changeset/parse-add-args';

describe('parseAddArgs', () => {
  it('reads positional arguments, the summary being the rest', () => {
    expect(parseAddArgs(['core', 'minor', 'Add', 'a', 'thing.'])).toEqual({
      token: 'core',
      bump: 'minor',
      summary: 'Add a thing.',
    });
  });

  it('reads flags, in any order', () => {
    expect(parseAddArgs(['-t', 'patch', '--package', 'react', '-s', 'Fix', 'it.'])).toEqual({
      token: 'react',
      bump: 'patch',
      summary: 'Fix it.',
    });
    expect(parseAddArgs(['--type', 'major', '-p', 'x', '--summary', 'Break.'])).toEqual({
      token: 'x',
      bump: 'major',
      summary: 'Break.',
    });
  });

  it('refuses an unknown bump', () => {
    expect(() => parseAddArgs(['core', 'huge', 'x'])).toThrow('invalid bump "huge"');
    expect(() => parseAddArgs(['-t'])).toThrow('invalid bump ""');
  });

  it.each([[[]], [['core']], [['core', 'patch']], [['core', 'patch', ' ']], [['-p']]])(
    'prints the usage when something is missing: %j',
    (argv) => {
      expect(() => parseAddArgs(argv)).toThrow('usage: rxova-repo-config add-changeset');
    },
  );
});

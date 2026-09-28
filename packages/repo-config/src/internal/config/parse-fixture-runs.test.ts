import { describe, expect, it } from 'vitest';
import { parseFixtureRuns } from '@/internal/config/parse-fixture-runs';

describe('parseFixtureRuns', () => {
  it('reads runs with and without a fixture', () => {
    const run = {
      bin: 'rxova-codemod',
      args: ['input-otp-to-otp', 'fixture.tsx'],
      fixture: { path: 'fixture.tsx', contents: '<OTPInput />' },
      expect: ['OtpInput'],
    };
    expect(parseFixtureRuns([run, { bin: 'x', expect: ['ok'] }], 'p')).toEqual([
      run,
      { bin: 'x', args: [], expect: ['ok'] },
    ]);
    expect(parseFixtureRuns(undefined, 'p')).toBeUndefined();
  });

  it.each([
    [{}, 'p must be an array'],
    [['x'], 'p[0] must be a { bin, args, fixture?, expect } object'],
    [[{ bin: 'x' }], 'p[0] must be a { bin, args, fixture?, expect } object'],
    [[{ expect: [] }], 'p[0] must be a { bin, args, fixture?, expect } object'],
    [[{ bin: 'x', expect: [], y: 1 }], 'unknown key "y"'],
    [
      [{ bin: 'x', expect: [], fixture: { path: 'a' } }],
      'p[0].fixture must be a { path, contents }',
    ],
    [
      [{ bin: 'x', expect: [], fixture: { contents: 'a' } }],
      'p[0].fixture must be a { path, contents }',
    ],
  ])('refuses %j', (value, message) => {
    expect(() => parseFixtureRuns(value, 'p')).toThrow(message);
  });
});

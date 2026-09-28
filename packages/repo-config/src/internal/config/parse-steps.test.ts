import { describe, expect, it } from 'vitest';
import { parseSteps } from '@/internal/config/parse-steps';

describe('parseSteps', () => {
  it('reads name and command pairs, and nothing else from them', () => {
    expect(parseSteps([{ name: 'lint', command: 'pnpm lint', extra: 1 }])).toEqual([
      { name: 'lint', command: 'pnpm lint' },
    ]);
    expect(parseSteps([])).toEqual([]);
  });

  it('keeps skipOnRelease when it is set', () => {
    expect(
      parseSteps([
        { name: 'audit', command: 'pnpm audit', skipOnRelease: true },
        { name: 'lint', command: 'pnpm lint', skipOnRelease: false },
      ]),
    ).toEqual([
      { name: 'audit', command: 'pnpm audit', skipOnRelease: true },
      { name: 'lint', command: 'pnpm lint', skipOnRelease: false },
    ]);
  });

  it('refuses a skipOnRelease that is not a boolean', () => {
    expect(() => parseSteps([{ name: 'a', command: 'b', skipOnRelease: 'yes' }])).toThrow(
      'repoConfig.verify.steps[0].skipOnRelease must be a boolean',
    );
  });

  it('refuses anything but an array', () => {
    expect(() => parseSteps({})).toThrow('repoConfig.verify.steps must be an array');
  });

  it.each([
    [{ name: 'x' }],
    [{ name: '', command: 'x' }],
    [{ name: 'x', command: '' }],
    ['pnpm lint'],
  ])('refuses the step %j, by position', (step) => {
    expect(() => parseSteps([{ name: 'ok', command: 'ok' }, step])).toThrow(
      'repoConfig.verify.steps[1] must be a { name, command } pair of strings',
    );
  });
});

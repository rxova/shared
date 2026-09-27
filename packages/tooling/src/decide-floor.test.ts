import { describe, expect, it } from 'vitest';
import { decideFloor } from './decide-floor.js';

describe('decideFloor', () => {
  it('returns the floor the packages share', () => {
    const floor = decideFloor([
      { dir: 'packages/a', name: 'a', floor: '22.13' },
      { dir: 'packages/b', name: 'b', floor: '22.13' },
    ]);
    expect(floor).toBe('22.13');
  });

  it('returns nothing when nothing is published', () => {
    expect(decideFloor([])).toBeUndefined();
  });

  it('refuses packages that disagree, naming each', () => {
    expect(() =>
      decideFloor([
        { dir: 'packages/a', name: 'a', floor: '20.11' },
        { dir: 'packages/b', name: 'b', floor: '22.13' },
      ]),
    ).toThrow('(a 20.11, b 22.13)');
  });
});

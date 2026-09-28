import { describe, expect, it } from 'vitest';
import { readEnum } from '@/internal/config/read-enum';

describe('readEnum', () => {
  it('reads one of the values or nothing', () => {
    expect(readEnum({ a: 'x' }, 'a', 'p', ['x', 'y'])).toBe('x');
    expect(readEnum({}, 'a', 'p', ['x'])).toBeUndefined();
  });

  it('refuses another value and lists the allowed ones', () => {
    expect(() => readEnum({ a: 'z' }, 'a', 'p', ['x', 'y'])).toThrow(
      'package.json#p.a must be one of "x", "y"',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { readString } from './read-string.js';

describe('readString', () => {
  it('reads a string', () => {
    expect(readString({ a: 'x' }, 'a')).toBe('x');
  });

  it('treats another type as absent', () => {
    expect(readString({ a: 1 }, 'a')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { objectTag } from '@/safe/object-tag';

describe('objectTag', () => {
  it('reads the tag', () => {
    expect(objectTag(new Map())).toBe('[object Map]');
    expect(objectTag(null)).toBe('[object Null]');
  });

  it('is undefined when the tag getter throws', () => {
    const value = Object.defineProperty({}, Symbol.toStringTag, {
      get() {
        throw new Error('tag');
      },
    });
    expect(objectTag(value)).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { readDotted } from '@/internal/packages/read-dotted';

describe('readDotted', () => {
  it('walks the path', () => {
    expect(readDotted({ rxova: { slug: 'otp' } }, 'rxova.slug')).toBe('otp');
    expect(readDotted({ a: 1 }, 'a')).toBe(1);
  });

  it('is undefined when a step is missing or not an object', () => {
    expect(readDotted({ rxova: 'x' }, 'rxova.slug')).toBeUndefined();
    expect(readDotted({}, 'rxova.slug')).toBeUndefined();
    expect(readDotted({}, 'toString')).toBeUndefined();
  });
});

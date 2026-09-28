import { describe, expect, it } from 'vitest';
import { readIfPresent } from '@/internal/pack-smoke/read-if-present';

describe('readIfPresent', () => {
  it('returns what the reader returns, or undefined when it throws', () => {
    expect(readIfPresent(() => 'text', '/a')).toBe('text');
    expect(
      readIfPresent(() => {
        throw new Error('ENOENT');
      }, '/a'),
    ).toBeUndefined();
  });
});

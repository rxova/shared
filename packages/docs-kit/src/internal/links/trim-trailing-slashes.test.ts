import { describe, expect, it } from 'vitest';
import { trimTrailingSlashes } from '@/internal/links/trim-trailing-slashes';

describe('trimTrailingSlashes', () => {
  it.each([
    ['/packages/x/', '/packages/x'],
    ['https://x.org//', 'https://x.org'],
    ['/', ''],
    ['', ''],
    ['a/b', 'a/b'],
  ])('%j is %j', (text, expected) => {
    expect(trimTrailingSlashes(text)).toBe(expected);
  });

  it('is linear on a long run of slashes', () => {
    expect(trimTrailingSlashes(`${'/'.repeat(100_000)}x`)).toHaveLength(100_001);
  });
});

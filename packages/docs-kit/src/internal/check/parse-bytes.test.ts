import { describe, expect, it } from 'vitest';
import { parseBytes } from '@/internal/check/parse-bytes';

describe('parseBytes', () => {
  it.each([
    ['800k', 800 * 1024],
    ['24K', 24 * 1024],
    ['1m', 1024 * 1024],
    [' 512 ', 512],
  ])('%s is %d bytes', (text, bytes) => {
    expect(parseBytes(text)).toBe(bytes);
  });

  it.each(['', 'lots', '1.5k', '-1'])('rejects %j', (text) => {
    expect(parseBytes(text)).toBeUndefined();
  });
});

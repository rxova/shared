import { describe, expect, it } from 'vitest';
import { countLines } from '@/internal/size/count-lines';

describe('countLines', () => {
  it.each([
    ['', 0],
    ['a', 1],
    ['a\n', 1],
    ['a\nb', 2],
    ['a\n\n', 2],
  ])('%j has %i', (text, lines) => {
    expect(countLines(text)).toBe(lines);
  });
});

import { describe, expect, it } from 'vitest';
import { isRecord } from '@/internal/config/is-record';

describe('isRecord', () => {
  it.each([{}, { a: 1 }, new Date(0), Object.create(null) as object])('accepts %o', (value) => {
    expect(isRecord(value)).toBe(true);
  });

  it.each([null, undefined, 'x', 1, [], () => 1])('rejects %o', (value) => {
    expect(isRecord(value)).toBe(false);
  });
});

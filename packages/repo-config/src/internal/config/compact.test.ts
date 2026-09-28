import { describe, expect, it } from 'vitest';
import { compact } from '@/internal/config/compact';

describe('compact', () => {
  it('drops the undefined fields and keeps the rest, falsy ones included', () => {
    expect(
      compact<{ a?: number; b?: boolean; c?: string }>({ a: undefined, b: false, c: '' }),
    ).toEqual({
      b: false,
      c: '',
    });
    expect(Object.keys(compact<{ a?: number }>({ a: undefined }))).toEqual([]);
  });
});

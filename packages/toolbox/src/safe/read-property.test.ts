import { describe, expect, it } from 'vitest';
import { readProperty } from '@/safe/read-property';
import { throwingGetter } from '@/safe/safe-values.fixtures';

describe('readProperty', () => {
  it('reads a property', () => {
    expect(readProperty({ a: 1 }, 'a')).toBe(1);
  });

  it('treats a throwing getter as absent', () => {
    expect(readProperty(throwingGetter, 'value')).toBeUndefined();
  });
});

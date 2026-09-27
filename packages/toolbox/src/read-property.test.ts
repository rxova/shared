import { describe, expect, it } from 'vitest';
import { readProperty } from './read-property.js';
import { throwingGetter } from './safe-values.fixtures.js';

describe('readProperty', () => {
  it('reads a property', () => {
    expect(readProperty({ a: 1 }, 'a')).toBe(1);
  });

  it('treats a throwing getter as absent', () => {
    expect(readProperty(throwingGetter, 'value')).toBeUndefined();
  });
});

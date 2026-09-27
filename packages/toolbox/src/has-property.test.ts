import { describe, expect, it } from 'vitest';
import { hasProperty } from './has-property.js';
import { hostile } from './safe-values.fixtures.js';

describe('hasProperty', () => {
  it('follows the prototype chain, like `in`', () => {
    expect(hasProperty({}, 'toString')).toBe(true);
    expect(hasProperty({}, 'missing')).toBe(false);
  });

  it('is false when a proxy refuses', () => {
    expect(hasProperty(hostile(), 'a')).toBe(false);
  });
});

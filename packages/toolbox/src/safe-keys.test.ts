import { describe, expect, it } from 'vitest';
import { safeKeys } from './safe-keys.js';
import { hostile } from './safe-values.fixtures.js';

describe('safeKeys', () => {
  it('lists own enumerable keys', () => {
    expect(safeKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
  });

  it('is empty when a proxy refuses', () => {
    expect(safeKeys(hostile())).toEqual([]);
  });
});

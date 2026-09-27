import { describe, expect, it } from 'vitest';
import { safeKeys } from '@/safe/safe-keys';
import { hostile } from '@/safe/safe-values.fixtures';

describe('safeKeys', () => {
  it('lists own enumerable keys', () => {
    expect(safeKeys({ a: 1, b: 2 })).toEqual(['a', 'b']);
  });

  it('is empty when a proxy refuses', () => {
    expect(safeKeys(hostile())).toEqual([]);
  });
});

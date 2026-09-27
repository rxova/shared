import { describe, expect, it } from 'vitest';
import { arrayItems } from './array-items.js';

describe('arrayItems', () => {
  it('snapshots an array', () => {
    const source = [1, 2];
    const items = arrayItems(source);
    expect(items).toEqual([1, 2]);
    expect(items).not.toBe(source);
  });

  it('is undefined for anything else', () => {
    expect(arrayItems({ length: 1 })).toBeUndefined();
  });

  it('is undefined when the array is a revoked proxy', () => {
    const { proxy, revoke } = Proxy.revocable<unknown[]>([], {});
    revoke();
    expect(arrayItems(proxy)).toBeUndefined();
  });
});

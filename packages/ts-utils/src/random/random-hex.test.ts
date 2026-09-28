import { afterEach, describe, expect, it, vi } from 'vitest';
import { randomHex } from '@/random/random-hex';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('randomHex', () => {
  it('is twice as many lowercase hex characters as bytes', () => {
    expect(randomHex(8)).toMatch(/^[0-9a-f]{16}$/);
    expect(randomHex(16)).toMatch(/^[0-9a-f]{32}$/);
    expect(randomHex(0)).toBe('');
  });

  it('reads crypto.getRandomValues, padding each byte to two digits', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (buffer: Uint8Array) => {
        buffer.set([0, 15, 16, 255]);
        return buffer;
      },
    });
    expect(randomHex(4)).toBe('000f10ff');
  });

  it('does not differ between two calls in practice', () => {
    expect(randomHex(16)).not.toBe(randomHex(16));
  });

  it('falls back to Math.random without crypto, telling onFallback once', () => {
    vi.stubGlobal('crypto', undefined);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const onFallback = vi.fn();

    expect(randomHex(3, { onFallback })).toBe('808080');
    expect(randomHex(2, { onFallback })).toBe('8080');
    expect(onFallback).toHaveBeenCalledOnce();
  });

  it('falls back silently without onFallback, and when getRandomValues is missing', () => {
    vi.stubGlobal('crypto', {});
    expect(randomHex(4)).toMatch(/^[0-9a-f]{8}$/);
  });

  it.each([-1, 1.5, Number.NaN])('rejects %s bytes', (bytes) => {
    expect(() => randomHex(bytes)).toThrow(RangeError);
  });
});

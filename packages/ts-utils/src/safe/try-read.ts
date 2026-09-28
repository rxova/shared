import type { ReadResult } from '@/safe/try-read.types';

/**
 * Reads a property, reporting whether the read itself succeeded. Code that
 * inspects a value it does not own must not replace the problem it is
 * reporting with a new one raised by a getter or a revoked proxy.
 */
export const tryRead = (value: object, key: PropertyKey): ReadResult => {
  try {
    return { ok: true, value: Reflect.get(value, key) };
  } catch {
    return { ok: false };
  }
};

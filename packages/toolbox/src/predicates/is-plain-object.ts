import { isRecord } from '@/predicates/is-record';

/**
 * A plain data object: an object literal, a `JSON.parse` result, or an
 * `Object.create(null)` bag. Arrays and class instances are rejected, because
 * key-wise iteration silently mangles them.
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

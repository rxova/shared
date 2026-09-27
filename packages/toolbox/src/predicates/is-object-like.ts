/**
 * Any non-null object: arrays, class instances and null-prototype bags
 * included. The `typeof value === 'object' && value !== null` check, named.
 * Safe to read a property off, nothing more.
 */
export const isObjectLike = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

import { isObjectLike } from './is-object-like.js';

/**
 * A non-null, non-array object, indexable by string key. Class instances pass;
 * reach for {@link isPlainObject} when a `Date` or a `Map` must not.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  isObjectLike(value) && !Array.isArray(value);

import { isInstanceOf } from './is-instance-of.js';
import { isObjectLike } from './is-object-like.js';
import { objectTag } from './object-tag.js';

/**
 * A real `Error`, from this realm or another. An object that merely has a
 * `message` is not one: that looser shape is a policy some callers want and
 * others must not have, so it stays with them.
 */
export const isError = (value: unknown): value is Error =>
  isInstanceOf(value, Error) || (isObjectLike(value) && objectTag(value) === '[object Error]');

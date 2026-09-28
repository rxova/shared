import { isInstanceOf } from "@/safe/is-instance-of";
import { isObjectLike } from "@/predicates/is-object-like";
import { objectTag } from "@/safe/object-tag";

/**
 * A real `Error`, from this realm or another. An object that merely has a
 * `message` is not one: that looser shape is a policy some callers want and
 * others must not have, so it stays with them.
 */
export const isError = (value: unknown): value is Error =>
  isInstanceOf(value, Error) || (isObjectLike(value) && objectTag(value) === "[object Error]");

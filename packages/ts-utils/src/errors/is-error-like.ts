import { isObjectLike } from "@/predicates/is-object-like";
import { readProperty } from "@/safe/read-property";

/**
 * Anything shaped like an error: an object whose `message` is a string. Looser
 * than `isError` on purpose — a plain `{ message }` from JSON, a DOMException
 * from another realm and an error-like from a library that does not extend
 * `Error` all pass. A getter or proxy that throws on `message` makes it false
 * rather than making the check throw.
 *
 * Narrowed to `Error` because that is what callers read off it (`message`, and
 * optionally `name`, `stack`, `cause`); only `message` is guaranteed.
 */
export const isErrorLike = (value: unknown): value is Error =>
  isObjectLike(value) && typeof readProperty(value, "message") === "string";

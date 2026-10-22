import { stableStringify } from "@/json/stable-stringify";

/**
 * Whether two values describe the same JSON document, whatever order their
 * keys are written in — the comparison `JSON.stringify(a) === JSON.stringify(b)`
 * is reaching for and gets wrong the moment one side was built in a different
 * order or round-tripped through another system.
 *
 * Same rules as `stableStringify`, so what JSON cannot carry does not count:
 * `{ a: undefined }` equals `{}`, and a `Date` equals its own ISO string.
 * A cycle on either side throws a `TypeError`.
 */
export const jsonEqual = (a: unknown, b: unknown): boolean =>
  stableStringify(a) === stableStringify(b);

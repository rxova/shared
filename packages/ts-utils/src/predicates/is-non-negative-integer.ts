/**
 * A whole number from 0 up to `Number.MAX_SAFE_INTEGER`: a count, an index, a
 * size. Above that bound integers stop being exact (`2 ** 53 + 1` reads back as
 * `2 ** 53`), so a count there is already wrong and is rejected. `-0` passes,
 * as it compares equal to 0.
 */
export const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

/**
 * `items` cut into runs of `size`, in order; the last run holds what is left
 * and is shorter when `size` does not divide the length. An empty list gives no
 * runs. A size that is not a whole number from 1 is a bug at the call site (it
 * would loop forever or drop items), so it throws.
 */
export const chunk = <T>(items: readonly T[], size: number): T[][] => {
  if (!Number.isSafeInteger(size) || size < 1) {
    throw new RangeError(`chunk: size must be a positive integer, got ${String(size)}`);
  }
  const runs: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    runs.push(items.slice(start, start + size));
  }
  return runs;
};

/** A comma-separated flag value as its trimmed, non-empty items; `undefined` when the flag was not given. */
export const splitList = (value: string | undefined): string[] | undefined =>
  value
    ?.split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');

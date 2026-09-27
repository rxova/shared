/** `>=22.13` → `22.13`. Anything but a plain lower bound has no single floor to test. */
export const floorOf = (range: string): string | undefined =>
  /^>=\s*v?(\d+(?:\.\d+){0,2})$/.exec(range.trim())?.[1];

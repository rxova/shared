/** `values` as a row of block heights, scaled between their own lowest and highest. */
export const sparkline = (values: readonly number[]): string => {
  if (values.length === 0) return "";
  const low = Math.min(...values);
  const span = Math.max(...values) - low;
  return values
    .map((value) => "▁▂▃▄▅▆▇█".charAt(span === 0 ? 0 : Math.round(((value - low) / span) * 7)))
    .join("");
};

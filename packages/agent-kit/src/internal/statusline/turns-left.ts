/**
 * About how many more turns fit in the context, from how much it grew per turn across `history`
 * (token counts, oldest first). Undefined until two turns have grown it.
 */
export const turnsLeft = (history: readonly number[], size: number): number | undefined => {
  let previous: number | undefined;
  const growth = history.flatMap((tokens) => {
    const step = previous === undefined ? 0 : tokens - previous;
    previous = tokens;
    return step > 0 ? [step] : [];
  });
  const last = history.at(-1);
  if (growth.length < 2 || last === undefined) return undefined;
  const average = growth.reduce((sum, step) => sum + step, 0) / growth.length;
  return Math.max(0, Math.floor((size - last) / average));
};

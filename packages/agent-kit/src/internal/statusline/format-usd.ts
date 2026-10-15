/** Dollars at a precision that suits the size: `$0.042`, `$3.42`, `$128`. */
export const formatUsd = (usd: number): string => {
  if (usd >= 100) return `$${String(Math.round(usd))}`;
  if (usd > 0 && usd < 0.1) return `$${usd.toFixed(3)}`;
  return `$${usd.toFixed(2)}`;
};

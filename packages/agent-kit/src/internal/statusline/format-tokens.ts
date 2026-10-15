/** A token count, short: `842`, `12.3k`, `186k`, `1.2M`. */
export const formatTokens = (tokens: number): string => {
  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, "");
  // Anything that would round up to 1000k reads as 1M.
  if (tokens >= 999_500) return `${trim(tokens / 1_000_000)}M`;
  if (tokens >= 100_000) return `${String(Math.round(tokens / 1000))}k`;
  if (tokens >= 999.5) return `${trim(tokens / 1000)}k`;
  return String(Math.round(tokens));
};

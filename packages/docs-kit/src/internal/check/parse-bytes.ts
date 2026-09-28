/** `800k`, `1m` or a plain byte count as bytes (k and m are binary); `undefined` when unreadable. */
export const parseBytes = (text: string): number | undefined => {
  const match = /^(\d+)([km])?$/i.exec(text.trim());
  if (match?.[1] === undefined) return undefined;
  const unit = match[2]?.toLowerCase();
  return Number(match[1]) * (unit === "m" ? 1024 * 1024 : unit === "k" ? 1024 : 1);
};

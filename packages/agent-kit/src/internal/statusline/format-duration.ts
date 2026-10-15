/** A span of seconds in its two largest units: `45s`, `12m`, `1h05m`, `3d04h`. */
export const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const pad = (value: number) => String(value).padStart(2, "0");
  if (days > 0) return `${String(days)}d${pad(hours)}h`;
  if (hours > 0) return `${String(hours)}h${pad(minutes)}m`;
  if (minutes > 0) return `${String(minutes)}m`;
  return `${String(total)}s`;
};

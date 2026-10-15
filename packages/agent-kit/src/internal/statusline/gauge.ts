/**
 * A bar `width` cells wide filled to `fraction` (0 to 1) in eighths of a cell: the filled part
 * and the empty track, returned apart so each can take its own colour.
 */
export const gauge = (fraction: number, width: number): { filled: string; empty: string } => {
  const eighths = Math.round(Math.min(1, Math.max(0, fraction)) * width * 8);
  const whole = Math.floor(eighths / 8);
  const part = eighths % 8;
  const partial = part === 0 ? "" : "▏▎▍▌▋▊▉".charAt(part - 1);
  const used = whole + (partial === "" ? 0 : 1);
  return { filled: "█".repeat(whole) + partial, empty: "─".repeat(Math.max(0, width - used)) };
};

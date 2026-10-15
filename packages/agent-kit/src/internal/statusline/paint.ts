import type { ColorMode, Rgb } from "@/internal/statusline/statusline.types";

/** `text` in the foreground colour `rgb`, bold when asked, as the terminal's `mode` allows. */
export const paint = (rgb: Rgb, text: string, mode: ColorMode, bold = false): string => {
  if (mode === "none" || text === "") return text;
  const [r, g, b] = rgb;
  // The xterm 6x6x6 cube's steps sit at 0, 95, 135, 175, 215 and 255.
  const cube = (value: number) =>
    value < 48 ? 0 : value < 115 ? 1 : Math.round((value - 55) / 40);
  const color =
    mode === "truecolor"
      ? `38;2;${String(r)};${String(g)};${String(b)}`
      : `38;5;${String(16 + 36 * cube(r) + 6 * cube(g) + cube(b))}`;
  return `\u001b[${bold ? "1;" : ""}${color}m${text}\u001b[0m`;
};

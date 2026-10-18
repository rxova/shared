import type { Rgb, Run } from "@/internal/statusline/statusline.types";

/**
 * One stretch of coloured text. Segment builders call this instead of painting escape codes, so
 * the colour survives to whichever renderer takes the segment: ANSI, or OpenCode's OpenTUI.
 */
export const run = (rgb: Rgb, text: string, bold = false, href?: string): Run => ({
  text,
  rgb,
  bold,
  href,
});

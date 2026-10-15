import type { Rgb } from "@/internal/statusline/statusline.types";

/** The status line palette: muted chrome, saturated data. */
export const THEME = {
  label: [108, 112, 134],
  dim: [88, 91, 112],
  text: [205, 214, 244],
  model: [203, 166, 247],
  project: [137, 180, 250],
  clean: [166, 227, 161],
  dirty: [249, 226, 175],
  added: [166, 227, 161],
  removed: [243, 139, 168],
  cost: [250, 179, 135],
  cache: [148, 226, 213],
  link: [116, 199, 236],
  warn: [243, 139, 168],
  track: [49, 50, 68],
} as const satisfies Record<string, Rgb>;

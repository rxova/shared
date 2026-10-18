import type { ColorMode, Run } from "@/internal/statusline/statusline.types";
import { hyperlink } from "@/internal/statusline/hyperlink";
import { paint } from "@/internal/statusline/paint";

/** `runs` as one ANSI string: the Claude Code renderer's backend. */
export const paintRuns = (runs: readonly Run[], mode: ColorMode): string =>
  runs.map(({ text, rgb, bold, href }) => hyperlink(href, paint(rgb, text, mode, bold))).join("");

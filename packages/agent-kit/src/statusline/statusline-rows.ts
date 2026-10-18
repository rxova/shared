import type { StatusFacts, StatusInput, TuiCell } from "@/internal/statusline/statusline.types";
import { contextSegments } from "@/internal/statusline/context-segments";
import { fitSegments } from "@/internal/statusline/fit-segments";
import { hexColor } from "@/internal/statusline/hex-color";
import { identitySegments } from "@/internal/statusline/identity-segments";
import { limitSegments } from "@/internal/statusline/limit-segments";
import { run } from "@/internal/statusline/run";
import { THEME } from "@/internal/statusline/theme";

/**
 * The same three rows `renderStatusline` paints, handed over as cells instead of escape codes so
 * a host that styles text itself can draw them. OpenCode's plugin renders these; the rows, their
 * order and what gets dropped on a narrow terminal are decided once, here and in the segments.
 */
export const statuslineRows = (input: StatusInput, facts: StatusFacts): TuiCell[][] => {
  const separator = [run(THEME.dim, " ┃ ")];
  return [identitySegments, contextSegments, limitSegments]
    .map((segments) =>
      fitSegments(segments(input, facts), separator, facts.columns).map(
        ({ text, rgb, bold, href }): TuiCell => ({ text, fg: hexColor(rgb), bold, href }),
      ),
    )
    .filter((cells) => cells.length > 0);
};

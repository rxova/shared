import type { Run, Segment } from "@/internal/statusline/statusline.types";
import { runsWidth } from "@/internal/statusline/runs-width";

/**
 * The segments joined by `separator`, dropping the lowest-priority ones (the last of equals
 * first) until the line fits in `columns`. The highest-priority segment always stays. Runs come
 * back rather than text, so the caller decides whether the line is painted or drawn.
 */
export const fitSegments = (
  segments: readonly Segment[],
  separator: readonly Run[],
  columns: number,
): Run[] => {
  const kept = segments.filter(({ runs }) => runsWidth(runs) > 0);
  const width = () =>
    kept.reduce((sum, { runs }) => sum + runsWidth(runs), 0) +
    runsWidth(separator) * Math.max(0, kept.length - 1);
  while (kept.length > 1 && width() > columns) {
    const lowest = Math.min(...kept.map(({ priority }) => priority));
    kept.splice(
      kept.findLastIndex(({ priority }) => priority === lowest),
      1,
    );
  }
  return kept.flatMap(({ runs }, index) => (index === 0 ? [...runs] : [...separator, ...runs]));
};

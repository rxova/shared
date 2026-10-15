import type { Segment } from "@/internal/statusline/statusline.types";
import { visibleWidth } from "@/internal/statusline/visible-width";

/**
 * The segments joined by `separator`, dropping the lowest-priority ones (the last of equals first)
 * until the line fits in `columns`. The highest-priority segment always stays.
 */
export const fitSegments = (
  segments: readonly Segment[],
  separator: string,
  columns: number,
): string => {
  const kept = segments.filter((segment) => segment.text !== "");
  const width = () =>
    kept.reduce((sum, { text }) => sum + visibleWidth(text), 0) +
    visibleWidth(separator) * Math.max(0, kept.length - 1);
  while (kept.length > 1 && width() > columns) {
    const lowest = Math.min(...kept.map(({ priority }) => priority));
    kept.splice(
      kept.findLastIndex(({ priority }) => priority === lowest),
      1,
    );
  }
  return kept.map(({ text }) => text).join(separator);
};

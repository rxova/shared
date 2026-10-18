import type { Run } from "@/internal/statusline/statusline.types";

/** How many terminal cells `runs` take, counting each grapheme as one cell. */
export const runsWidth = (runs: readonly Run[]): number =>
  runs.reduce((sum, { text }) => sum + [...new Intl.Segmenter().segment(text)].length, 0);

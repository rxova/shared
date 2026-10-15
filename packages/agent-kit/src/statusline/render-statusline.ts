import type { StatusFacts, StatusInput } from "@/internal/statusline/statusline.types";
import { contextSegments } from "@/internal/statusline/context-segments";
import { fitSegments } from "@/internal/statusline/fit-segments";
import { identitySegments } from "@/internal/statusline/identity-segments";
import { limitSegments } from "@/internal/statusline/limit-segments";
import { paint } from "@/internal/statusline/paint";
import { THEME } from "@/internal/statusline/theme";

/**
 * The status line, up to three rows, each cut to the terminal width by dropping its least
 * important segments: who and where (model, project, git, pull request), the context and what it
 * costs, and the rate limits with session details. An empty row is left out.
 */
export const renderStatusline = (input: StatusInput, facts: StatusFacts): string[] => {
  const separator = paint(THEME.dim, " ┃ ", facts.mode);
  return [identitySegments, contextSegments, limitSegments]
    .map((segments) => fitSegments(segments(input, facts), separator, facts.columns))
    .filter((line) => line !== "");
};

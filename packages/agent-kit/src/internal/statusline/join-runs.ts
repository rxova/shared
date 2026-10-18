import type { Run } from "@/internal/statusline/statusline.types";

/** The parts that carry text, joined by `separator`; a part may itself be several runs. */
export const joinRuns = (parts: readonly (readonly Run[])[], separator: Run): Run[] =>
  parts
    .filter((part) => part.some(({ text }) => text !== ""))
    .flatMap((part, index) => (index === 0 ? [...part] : [separator, ...part]));

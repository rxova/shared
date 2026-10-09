import { carriesAttribution } from "./carries-attribution";

/** The text with every line that credits Claude removed, and the blank runs that leaves collapsed. */
export const withoutAttribution = (text: string): string =>
  text
    .split("\n")
    .filter((line) => !carriesAttribution(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();

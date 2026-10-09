import { carriesAttribution } from "./carries-attribution";

/** The lines of a text that credit Claude. */
export const attributionLines = (text: string): string[] =>
  text.split("\n").filter(carriesAttribution);

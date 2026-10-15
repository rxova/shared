/** `text` as an OSC 8 terminal hyperlink to `url`; terminals without them show the text alone. */
export const hyperlink = (url: string | undefined, text: string): string =>
  url === undefined || url === "" ? text : `\u001b]8;;${url}\u0007${text}\u001b]8;;\u0007`;

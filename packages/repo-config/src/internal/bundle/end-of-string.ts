/**
 * The index just past the quoted run that opens at `start` with `quote`, so a
 * `//` or `/*` inside a string is never read as the start of a comment. An
 * unterminated run ends the file, which is what the engine would say too.
 */
export const endOfString = (code: string, start: number, quote: string): number => {
  for (let at = start + 1; at < code.length; at += 1) {
    const char = code[at];
    if (char === "\\") {
      at += 1;
      continue;
    }
    if (char === quote) return at + 1;
  }
  return code.length;
};

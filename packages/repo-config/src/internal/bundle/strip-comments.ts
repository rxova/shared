import { endOfString } from "@/internal/bundle/end-of-string";

/**
 * `code` with every comment blanked to spaces, newlines kept, so the result
 * has the same length and the same line numbers as the original.
 *
 * Scanning for an identifier in built output has to skip the prose: a TSDoc
 * block that explains why `process.env.NODE_ENV` is spelled out is carried
 * into the bundle, and flagging it would make the check cry wolf on the very
 * comment that documents the rule. Quotes and template literals are tracked so
 * a `//` in a URL survives; a regular expression literal is not, which at
 * worst leaves a comment standing rather than cutting code.
 */
export const stripComments = (code: string): string => {
  const out = code.split("");
  const blank = (from: number, to: number): void => {
    for (let at = from; at < to; at += 1) if (out[at] !== "\n") out[at] = " ";
  };

  let index = 0;
  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];
    if (char === "/" && next === "/") {
      const end = code.indexOf("\n", index);
      const stop = end === -1 ? code.length : end;
      blank(index, stop);
      index = stop;
    } else if (char === "/" && next === "*") {
      const end = code.indexOf("*/", index + 2);
      const stop = end === -1 ? code.length : end + 2;
      blank(index, stop);
      index = stop;
    } else if (char === '"' || char === "'" || char === "`") {
      index = endOfString(code, index, char);
    } else {
      index += 1;
    }
  }
  return out.join("");
};

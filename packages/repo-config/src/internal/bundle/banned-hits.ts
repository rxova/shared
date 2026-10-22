import type { BannedHit } from "@/internal/bundle/banned-hits.types";
import { stripComments } from "@/internal/bundle/strip-comments";

/**
 * Every free mention of a `banned` identifier in `code`, with its line.
 *
 * Free is the whole point: `process` is a reference a bundler has to resolve,
 * while `env.process` or `globalThis.process` is a property read that resolves
 * at runtime to whatever is or is not there. The lookbehind drops member
 * accesses (`.process`, `?.process`) and anything that is merely a longer name
 * (`subprocess`, `processItem`).
 */
export const bannedHits = (file: string, code: string, banned: string[]): BannedHit[] => {
  const source = stripComments(code);
  return banned.flatMap((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(String.raw`(?<![$\w.])${escaped}(?![$\w])`, "g");
    return [...source.matchAll(pattern)].map((match) => ({
      file,
      name,
      line: source.slice(0, match.index).split("\n").length,
    }));
  });
};

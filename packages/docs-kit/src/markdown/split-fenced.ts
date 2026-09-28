import { mapUnfenced } from "@/markdown/map-unfenced";
import type { SplitDocument } from "@/markdown/split-fenced.types";

/**
 * The document split into what a rule may look at: the prose outside fences,
 * and the opening fence lines. The route checker uses the same split the
 * normalizer does, so the two can never disagree about where a fence begins —
 * scanning a whole twin would flag every snippet that legitimately contains a
 * root-relative path or a component tag.
 */
export const splitFenced = (text: string): SplitDocument => {
  const unfenced: string[] = [];
  const openers: string[] = [];
  mapUnfenced(
    text,
    (chunk) => {
      unfenced.push(chunk);
      return chunk;
    },
    (line) => {
      openers.push(line);
      return line;
    },
  );
  return { unfenced: unfenced.join("\n"), openers };
};

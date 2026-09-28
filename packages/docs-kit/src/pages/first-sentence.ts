import { MAX_DESCRIPTION } from "@/internal/pages/max-description";
import { splitFenced } from "@/markdown/split-fenced";

/**
 * The first sentence of a page body, for a page whose frontmatter has no
 * description — a bare link in llms.txt tells an agent nothing about which one
 * answers its question.
 *
 * Fence contents are dropped, not just the fence lines (a page that opens with
 * a diff would otherwise be described as `- statements: 95,`); so are
 * headings, JSX, imports, directives and tables. Links collapse to their text
 * and emphasis comes off before matching, or `**x** does y.` loses its
 * sentence end to a `*`. With no sentence inside 200 characters it truncates
 * on a word boundary; with nothing worth saying it returns `undefined`.
 */
export const firstSentence = (body: string): string | undefined => {
  const prose = splitFenced(body)
    .unfenced.split("\n")
    .filter(
      (line) =>
        line.trim() !== "" && !/^\s*(?:[`~]{3}|#|<|import\b|export\b|:::|\||-{3,})/.test(line),
    )
    .join(" ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`[\]]/g, "")
    .trim();

  const sentence = new RegExp(`^(.{20,${String(MAX_DESCRIPTION)}}?[.!?])\\s`).exec(
    `${prose} `,
  )?.[1];
  if (sentence !== undefined) return sentence;
  if (prose.length <= 20) return undefined;

  const clipped = prose.slice(0, MAX_DESCRIPTION);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 20 ? clipped.slice(0, lastSpace) : clipped).replace(/[,;:—-]$/, "")}…`;
};

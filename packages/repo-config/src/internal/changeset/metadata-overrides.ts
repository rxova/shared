import { OVERRIDE_PATTERNS } from "@/internal/changeset/override-patterns";
import { splitFrontmatter } from "@/internal/changeset/split-frontmatter";

/**
 * Every summary line of a changeset that `@changesets/changelog-github` would
 * read as metadata (see `OVERRIDE_PATTERNS`), with its line in the file. The
 * frontmatter is YAML, not summary, so it is never matched.
 */
export const metadataOverrides = (
  content: string,
): { line: number; override: string; text: string }[] => {
  const { summary, firstLine } = splitFrontmatter(content);
  return summary.split("\n").flatMap((text, index) =>
    OVERRIDE_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ name }) => ({
      line: firstLine + index,
      override: name,
      text: text.trim(),
    })),
  );
};

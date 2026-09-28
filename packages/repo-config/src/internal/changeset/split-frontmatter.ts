/**
 * A changeset's summary without its YAML frontmatter, and the 1-based line of
 * the file the summary starts on, so a problem is reported against the line an
 * editor shows. Without a closed frontmatter the whole file is the summary.
 */
export const splitFrontmatter = (content: string): { summary: string; firstLine: number } => {
  const lines = content.split('\n');
  if (lines[0]?.trim() !== '---') return { summary: content, firstLine: 1 };
  const closing = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (closing === -1) return { summary: content, firstLine: 1 };
  return { summary: lines.slice(closing + 1).join('\n'), firstLine: closing + 2 };
};

import { escapeRegExp } from '@/internal/markdown/escape-regexp';

/**
 * Removes layout component tags that sit alone on their line, keeping the
 * children, and turns a heading component's opening tag into a heading titled
 * by its `label` or `title` attribute — otherwise the install snippets in a
 * Tabs block arrive as unlabelled fences and the reader cannot tell npm from
 * pnpm, the one thing that block exists to say.
 */
export const unwrapComponents = (
  text: string,
  { unwrap, headings }: { unwrap: readonly string[]; headings: Readonly<Record<string, number>> },
): string => {
  let out = text;
  for (const [name, level] of Object.entries(headings)) {
    out = out.replace(
      new RegExp(
        `^[ \\t]*<${escapeRegExp(name)}\\b[^>]*\\b(?:label|title)="([^"]*)"[^>]*>[ \\t]*$`,
        'gm',
      ),
      `${'#'.repeat(level)} $1\n`,
    );
  }
  if (unwrap.length === 0) return out;
  const names = unwrap.map(escapeRegExp).join('|');
  return out.replace(new RegExp(`^[ \\t]*<\\/?(?:${names})\\b[^>]*>[ \\t]*$`, 'gm'), '');
};

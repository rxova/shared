/**
 * A one-package changeset. The package name is double-quoted, as
 * `changeset add` writes it and as the shared Prettier preset keeps it.
 */
export const changesetBody = (name: string, bump: string, summary: string): string =>
  `---\n"${name}": ${bump}\n---\n\n${summary.trim()}\n`;

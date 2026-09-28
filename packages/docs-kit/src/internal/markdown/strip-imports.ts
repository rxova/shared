/** Real MDX imports. Only ever called on unfenced text, where an `import` line is MDX, not a snippet. */
export const stripImports = (text: string): string => text.replace(/^import[ \t][^\n]*\n?/gm, "");

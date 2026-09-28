/** A code fence in a markdown file: its language, the rest of its info string, its code, and the line it opens on. */
export interface Snippet {
  language: string;
  info: string;
  code: string;
  line: number;
}

/** Every ` ```ts `, `tsx`, `js` or `jsx` fence in `source`, in order. */
export const fencedSnippets = (source: string): Snippet[] =>
  [...source.matchAll(/^```(tsx|ts|jsx|js)([^\n]*)\n([\s\S]*?)^```\s*$/gm)].map(
    ({ 0: _, 1: language = 'ts', 2: info = '', 3: code = '', index }) => ({
      language,
      info: info.trim(),
      code,
      line: source.slice(0, index).split('\n').length,
    }),
  );

import { readFileSync } from "node:fs";

/** The `key: value` lines between a Markdown file's opening `---` fences. */
export const readFrontmatter = (path: string): Record<string, string> => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/.exec(readFileSync(path, "utf8"));
  if (match?.[1] === undefined) return {};
  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .filter((line) => line.includes(":"))
      .map((line) => {
        const colon = line.indexOf(":");
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
      }),
  );
};

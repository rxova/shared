import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { matchesAny } from "@/internal/files/matches-any";
import { walkFiles } from "@/internal/files/walk-files";

/**
 * The files under `root` the `patterns` name, as sorted `/`-separated paths
 * relative to it, each once. A pattern is a glob (`packages/*\/README.md`), a
 * file, or a directory, which stands for every file under it.
 */
export const expandGlobs = (root: string, patterns: readonly string[]): string[] => {
  const found = patterns.flatMap((pattern) => {
    const clean = pattern.replace(/^\.?\/+/, "").replace(/\/+$/, "");
    const wild = clean.search(/[*?{]/);
    if (wild === -1) {
      const path = join(root, clean);
      if (!existsSync(path)) return [];
      return statSync(path).isDirectory()
        ? walkFiles(path).map((file) => `${clean}/${file}`)
        : [clean];
    }
    const base = clean.slice(0, clean.lastIndexOf("/", wild) + 1);
    return walkFiles(join(root, base))
      .map((file) => `${base}${file}`)
      .filter((file) => matchesAny(file, [clean]));
  });
  return [...new Set(found)].sort();
};

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isDirectory } from "@/internal/files/is-directory";
import { globRegExp } from "@/internal/pack-smoke/glob-regexp";

/**
 * The directories under `root` a `parent/*` style glob names, as sorted
 * `/`-separated paths: each pattern is a directory followed by one glob
 * segment (`packages/*`, `apps/*`). A literal directory names itself.
 */
export const expandDirs = (root: string, patterns: readonly string[]): string[] =>
  [
    ...new Set(
      patterns.flatMap((pattern) => {
        const clean = pattern.replace(/^\.?\/+/, "").replace(/\/+$/, "");
        const slash = clean.lastIndexOf("/");
        const parent = slash === -1 ? "" : clean.slice(0, slash);
        const leaf = clean.slice(slash + 1);
        const dir = join(root, parent);
        if (!/[*?{]/.test(leaf)) return isDirectory(join(root, clean)) ? [clean] : [];
        if (!existsSync(dir)) return [];
        const matcher = globRegExp(leaf);
        return readdirSync(dir, { withFileTypes: true })
          .filter((entry) => entry.isDirectory() && matcher.test(entry.name))
          .map((entry) => (parent === "" ? entry.name : `${parent}/${entry.name}`));
      }),
    ),
  ].sort();

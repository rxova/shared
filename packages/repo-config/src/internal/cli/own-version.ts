import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The version in the manifest above `from`, found by walking up from the
 * module: one level from a published `dist/`, one from `src/`.
 */
export const ownVersion = (from: string): string => {
  let dir = dirname(fileURLToPath(from));
  for (;;) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest))
      return (JSON.parse(readFileSync(manifest, "utf8")) as { version: string }).version;
    const parent = dirname(dir);
    if (parent === dir) throw new Error("rxova-repo-config: no package.json above the CLI");
    dir = parent;
  }
};

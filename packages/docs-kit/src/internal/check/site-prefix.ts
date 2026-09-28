import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * The absolute prefix this build's URLs carry — origin plus base — read back
 * out of the output, so the check cannot run against a different mount than
 * the one that was built. Each twin names its human page in `source:`, and the
 * twin's own path says what that URL's tail must be. `index.md` is skipped:
 * its route `/` is a suffix of every URL and pins nothing down.
 */
export const sitePrefix = async (
  distDir: string,
  mdFiles: readonly string[],
): Promise<string | undefined> => {
  for (const md of [...mdFiles].sort()) {
    if (md === "index.md") continue;
    const head = (await readFile(join(distDir, md), "utf8")).slice(0, 2048);
    const source = /^source:\s*(\S+)\s*$/m.exec(head)?.[1];
    const tail = `${md.replace(/\.md$/, "")}/`;
    if (source?.endsWith(tail) === true) return source.slice(0, -tail.length);
  }
  return undefined;
};

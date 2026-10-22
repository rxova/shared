import type { Reader } from "@/config/config.types";
import { join, posix } from "node:path";

/** A static import or re-export specifier, and the `import("…")` form too. */
const SPECIFIERS = /(?:\bfrom|\bimport)\s*\(?\s*["']([^"']+)["']/g;

/**
 * `entry` and every file it reaches through relative imports, as paths
 * relative to `dir`, in the order they were first seen.
 *
 * Only relative specifiers are followed, because those are the chunks a
 * bundler split out of this package: a bare specifier is someone else's
 * package, which this check has no say over. A file that cannot be read is
 * skipped rather than failing the run — the entry itself not being there is
 * the caller's problem to report.
 *
 * Specifiers are resolved with the posix rules whatever the host is, because
 * that is what they are: `./chunk.js` means the same thing in a bundle built
 * on Windows. Keeping the walk in one separator also keeps the visited set
 * honest, since `dist/a.js` and `dist\a.js` are two strings for one file.
 */
export const entryChunks = (dir: string, entry: string, read: Reader): string[] => {
  const seen = new Set<string>();
  const queue = [posix.normalize(entry)];
  while (queue.length > 0) {
    const file = queue.shift();
    if (file === undefined || seen.has(file)) continue;
    seen.add(file);
    const code = read(join(dir, file));
    if (code === undefined) continue;
    for (const [, specifier = ""] of code.matchAll(SPECIFIERS)) {
      if (!specifier.startsWith("./") && !specifier.startsWith("../")) continue;
      queue.push(posix.join(posix.dirname(file), specifier));
    }
  }
  return [...seen];
};

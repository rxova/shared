import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";

/** Every file under `dir` ending in `ext`, as POSIX paths relative to `root`. */
export const collectFiles = async (dir: string, ext: string, root = dir): Promise<string[]> => {
  const found: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await collectFiles(path, ext, root)));
    else if (entry.isFile() && entry.name.endsWith(ext)) {
      found.push(relative(root, path).split(sep).join("/"));
    }
  }
  return found;
};

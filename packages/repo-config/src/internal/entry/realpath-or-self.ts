import { realpathSync } from "node:fs";

/**
 * The path with symlinks resolved, or the path as given when it does not
 * exist. An installed bin is a link in `node_modules/.bin`, and pnpm links
 * every package into place, so a script path has to be resolved before it is
 * compared with a module URL.
 */
export const realpathOrSelf = (path: string): string => {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
};

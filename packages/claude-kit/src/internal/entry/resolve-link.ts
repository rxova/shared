import { realpathSync } from 'node:fs';

/** A path with its symlinks resolved, or the path itself when it cannot be. */
export const resolveLink = (path: string): string => {
  try {
    return realpathSync(path);
  } catch {
    return path;
  }
};

import { existsSync, statSync } from "node:fs";

/** Whether `path` is an existing directory. */
export const isDirectory = (path: string): boolean =>
  existsSync(path) && statSync(path).isDirectory();

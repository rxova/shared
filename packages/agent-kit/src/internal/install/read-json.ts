import { existsSync, readFileSync } from "node:fs";

/**
 * A JSON file's value, or undefined when there is no file. A file that is not valid JSON throws:
 * better to stop than to overwrite someone's settings with a fresh object.
 */
export const readJson = (path: string): unknown => {
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as unknown;
  } catch {
    throw new Error(`${path} is not valid JSON; fix or move it, then run again`);
  }
};

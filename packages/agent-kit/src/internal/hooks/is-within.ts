import { relative, isAbsolute } from "node:path";

/** Whether `path` is strictly inside `dir`: not `dir` itself, and not outside it. */
export const isWithin = (dir: string, path: string): boolean => {
  const rel = relative(dir, path);
  return rel !== "" && !rel.startsWith("..") && !isAbsolute(rel);
};

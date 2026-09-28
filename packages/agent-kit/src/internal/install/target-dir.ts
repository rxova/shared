import { isAbsolute, join } from "node:path";

/**
 * The `.claude` directory to install into: the user's, or the project's with `--project`. Throws
 * when the base directory is empty or relative (an unset `HOME`), rather than installing
 * relative to wherever the command happens to run.
 */
export const targetDir = (
  project: boolean,
  { home, cwd }: { home: string; cwd: string },
): string => {
  const base = project ? cwd : home;
  if (!isAbsolute(base))
    throw new Error(
      project
        ? `the working directory "${base}" is not an absolute path`
        : "no home directory (HOME is empty); set HOME or pass --project",
    );
  return join(base, ".claude");
};

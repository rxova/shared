import { join } from 'node:path';

/** The `.claude` directory to install into: the user's, or the project's with `--project`. */
export const targetDir = (project: boolean, { home, cwd }: { home: string; cwd: string }): string =>
  join(project ? cwd : home, '.claude');

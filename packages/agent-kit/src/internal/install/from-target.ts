import { join } from 'node:path';

/** A target-relative path (`/`-separated) as a path on this platform. */
export const fromTarget = (target: string, relative: string): string =>
  join(target, ...relative.split('/'));

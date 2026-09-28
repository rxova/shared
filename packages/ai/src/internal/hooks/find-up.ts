import { dirname, join } from 'node:path';

/** The nearest directory from `start` upwards that holds one of `markers`, or undefined. */
export const findUp = (
  start: string,
  markers: readonly string[],
  exists: (path: string) => boolean,
): string | undefined => {
  let dir = start;
  for (;;) {
    if (markers.some((marker) => exists(join(dir, marker)))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
};

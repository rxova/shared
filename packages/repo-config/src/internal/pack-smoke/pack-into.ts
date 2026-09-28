import { join } from 'node:path';
import type { Shell } from '@/pack-smoke/pack-smoke.types';

/** Packs `dir` into `destination` without running its scripts, and returns the tarball's path. */
export const packInto = (dir: string, destination: string, sh: Shell): string => {
  const [packed] = JSON.parse(
    sh('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', destination], dir),
  ) as { filename: string }[];
  if (packed === undefined) throw new Error(`npm pack produced no tarball for ${dir}`);
  return join(destination, packed.filename);
};

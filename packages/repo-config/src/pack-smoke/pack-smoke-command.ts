import type { ScratchFiles, Shell } from '@/pack-smoke/pack-smoke.types';
import { packSmoke } from '@/pack-smoke/pack-smoke';

/**
 * `rxova-repo-config pack-smoke [dir]`: smoke-tests the package in `dir`, the
 * working directory by default. Returns the process exit code rather than
 * taking it, so tests can call it.
 */
export const packSmokeCommand = (
  pkgDir: string = process.cwd(),
  deps: { sh?: Shell; fs?: ScratchFiles } = {},
): number => {
  try {
    console.log(packSmoke({ pkgDir, ...deps }));
    return 0;
  } catch (failure) {
    console.error(`pack:smoke failed — ${(failure as Error).message}`);
    return 1;
  }
};

import type { Shell } from '@/pack-smoke/pack-smoke.types';

/**
 * Every file in an npm tarball, as a path inside the package: `tar` lists
 * them under `package/`, which is dropped, and directory entries are skipped.
 */
export const tarballContents = (tarball: string, sh: Shell, cwd: string): string[] =>
  sh('tar', ['-tzf', tarball], cwd)
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^package\//, ''))
    .filter((path) => path !== '' && !path.endsWith('/'));

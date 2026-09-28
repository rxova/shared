import { globRegExp } from '@/internal/pack-smoke/glob-regexp';

/** Whether `path` matches one of the `globs` (`**`, `*`, `?`, `{a,b}`). */
export const matchesAny = (path: string, globs: readonly string[]): boolean =>
  globs.some((glob) => globRegExp(glob).test(path));

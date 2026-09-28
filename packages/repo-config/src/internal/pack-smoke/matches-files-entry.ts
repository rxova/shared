import { globRegExp } from '@/internal/pack-smoke/glob-regexp';

/**
 * Whether npm ships `path` because of the `files` entry `entry`: the entry
 * names the file itself, or a directory it sits in, since a listed directory
 * brings everything under it.
 */
export const matchesFilesEntry = (entry: string, path: string): boolean => {
  const pattern = globRegExp(entry);
  const segments = path.split('/');
  return segments.some((_, index) => pattern.test(segments.slice(0, index + 1).join('/')));
};

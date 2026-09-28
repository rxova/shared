import { matchesFilesEntry } from '@/internal/pack-smoke/matches-files-entry';

/**
 * The `wanted` entries — file names, directories or globs, as `files` spells
 * them — that match nothing in the tarball's `contents`. Negated entries
 * (`!…`) remove files rather than ship them, so they are not wanted.
 */
export const missingFiles = (wanted: readonly string[], contents: readonly string[]): string[] =>
  wanted.filter(
    (entry) => !entry.startsWith('!') && !contents.some((path) => matchesFilesEntry(entry, path)),
  );

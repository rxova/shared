import { FORBIDDEN_PATTERNS } from '@/internal/pack-smoke/forbidden-patterns';
import { matchesFilesEntry } from '@/internal/pack-smoke/matches-files-entry';

/**
 * The files in `contents` that look like source or tests (see
 * `FORBIDDEN_PATTERNS`). A file is allowed when a `files` entry that itself
 * names that kind of path brings it in — `"src"`, `"e2e/fixtures.json"`,
 * `"dist/**\/*.test.js"` — since shipping it was then a decision, not an
 * accident. `"dist"` bringing in `dist/a.test.js` is not one.
 */
export const forbiddenFiles = (contents: readonly string[], files: readonly string[]): string[] =>
  contents.filter((path) =>
    FORBIDDEN_PATTERNS.some(
      (pattern) =>
        pattern.test(path) &&
        !files.some(
          (entry) => pattern.test(entry.replace(/^\.?\/+/, '')) && matchesFilesEntry(entry, path),
        ),
    ),
  );

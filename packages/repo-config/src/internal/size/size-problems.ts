/**
 * One line per file over `max` lines that `allow` does not list, and per
 * allowed file that no longer needs to be: the allow list only shrinks.
 */
export const sizeProblems = (
  files: readonly { path: string; lines: number }[],
  max: number,
  allow: readonly string[],
): string[] =>
  files.flatMap(({ path, lines }) => {
    const allowed = allow.includes(path);
    if (lines > max && !allowed) return [`${path}: ${String(lines)} lines (limit ${String(max)})`];
    if (lines <= max && allowed) {
      return [
        `${path}: ${String(lines)} lines, within the limit now; remove it from repoConfig.fileSize.allow`,
      ];
    }
    return [];
  });

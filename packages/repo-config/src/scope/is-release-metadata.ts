/** True when a path only ever carries release bookkeeping: a changeset or a changelog. */
export const isReleaseMetadata = (file: string): boolean =>
  (file.startsWith(".changeset/") && file.endsWith(".md")) ||
  file === "CHANGELOG.md" ||
  file.endsWith("/CHANGELOG.md");

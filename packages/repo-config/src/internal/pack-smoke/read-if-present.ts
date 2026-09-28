/** Reads `file` with `read`, or returns undefined when it cannot be read. */
export const readIfPresent = (read: (file: string) => string, file: string): string | undefined => {
  try {
    return read(file);
  } catch {
    return undefined;
  }
};

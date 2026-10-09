/** The last segment of a path. */
export const baseName = (path: string): string => path.split("/").filter(Boolean).pop() ?? path;

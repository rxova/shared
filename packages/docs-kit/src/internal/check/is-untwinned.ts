/** Whether a built page is one of the `untwinned` paths, or under one ending in `/`. */
export const isUntwinned = (htmlPath: string, untwinned: readonly string[]): boolean =>
  untwinned.some((entry) =>
    entry.endsWith('/') ? htmlPath.startsWith(entry) : htmlPath === entry,
  );

/** `rxova-journey-core-<base36 time>.md`: the package, readable, and a suffix that does not collide. */
export const changesetFileName = (name: string, now: number): string =>
  `${name
    .replace(/^@/, "")
    .replace(/[^\w-]+/g, "-")
    .toLowerCase()}-${now.toString(36)}.md`;

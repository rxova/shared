/** The value at `path` inside parsed JSON, or undefined when any step is missing or not an object. */
export const valueAt = (value: unknown, ...path: string[]): unknown => {
  let current = value;
  for (const key of path) {
    if (typeof current !== "object" || current === null || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
};

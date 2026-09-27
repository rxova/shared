/** A snapshot of an array before walking it, or undefined for anything else. */
export const arrayItems = (value: unknown): unknown[] | undefined => {
  try {
    return Array.isArray(value) ? Array.from(value as readonly unknown[]) : undefined;
  } catch {
    return undefined;
  }
};

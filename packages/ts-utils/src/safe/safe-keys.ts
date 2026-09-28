/** Enumerable own keys, or none when a proxy refuses inspection. */
export const safeKeys = (value: object): string[] => {
  try {
    return Object.keys(value);
  } catch {
    return [];
  }
};

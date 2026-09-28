/** Throws on a key outside `allowed`: a typo must not fall back to a default. */
export const assertOnlyKeys = (
  value: Record<string, unknown>,
  path: string,
  allowed: string[],
): void => {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) {
      throw new Error(
        `package.json#${path} has an unknown key "${key}"; expected one of ${allowed.join(", ")}`,
      );
    }
  }
};

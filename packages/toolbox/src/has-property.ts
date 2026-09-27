/** `key in value`, without letting a proxy's `has` trap escape. */
export const hasProperty = (value: object, key: PropertyKey): boolean => {
  try {
    return Reflect.has(value, key);
  } catch {
    return false;
  }
};

/** `instanceof`, without letting a proxy or a custom `Symbol.hasInstance` escape. */
export const isInstanceOf = <Instance>(
  value: unknown,
  constructor: abstract new (...args: never[]) => Instance,
): value is Instance => {
  try {
    return value instanceof constructor;
  } catch {
    return false;
  }
};

/**
 * The `[object Tag]` string, which survives realms where `instanceof` does not:
 * a `Map` from an iframe is not `instanceof Map` here, but its tag is still
 * `[object Map]`. Undefined when even that is refused.
 */
export const objectTag = (value: unknown): string | undefined => {
  try {
    return Object.prototype.toString.call(value);
  } catch {
    return undefined;
  }
};

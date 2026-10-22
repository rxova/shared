/**
 * A new object with `record`'s own enumerable string keys, each value passed
 * through `transform` (which also gets the key). Symbol keys and inherited
 * properties are left out, as `Object.entries` leaves them out; a `__proto__`
 * key stays an ordinary own property rather than setting the prototype.
 */
export const mapValues = <Value, Result>(
  record: Readonly<Record<string, Value>>,
  transform: (value: Value, key: string) => Result,
): Record<string, Result> =>
  Object.fromEntries(Object.entries(record).map(([key, value]) => [key, transform(value, key)]));

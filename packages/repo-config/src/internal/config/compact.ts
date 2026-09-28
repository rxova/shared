/**
 * `value` without its undefined fields: a config section read field by field
 * holds only what the repository wrote, so `exactOptionalPropertyTypes` and a
 * deep equality both see the same object the JSON described.
 */
export const compact = <Shape extends object>(value: {
  [Key in keyof Shape]: Shape[Key] | undefined;
}): Shape =>
  Object.fromEntries(Object.entries(value).filter(([, field]) => field !== undefined)) as Shape;

/** Every string leaf of an exports map, in order: its conditions and subpaths all end in one. */
export const exportLeaves = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(exportLeaves);
  if (typeof value === "object" && value !== null)
    return Object.values(value).flatMap(exportLeaves);
  return [];
};

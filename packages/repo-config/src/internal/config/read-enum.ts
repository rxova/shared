import { failConfig } from "@/internal/config/fail-config";

/** `section[key]` as one of `values`, or undefined when it is absent. */
export const readEnum = <Value extends string>(
  section: Record<string, unknown>,
  key: string,
  path: string,
  values: readonly Value[],
): Value | undefined => {
  const value = section[key];
  if (value === undefined) return undefined;
  if (values.some((allowed) => allowed === value)) return value as Value;
  return failConfig(`${path}.${key}`, `one of ${values.map((item) => `"${item}"`).join(", ")}`);
};

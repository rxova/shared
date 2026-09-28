import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";

/** `section[key]` as an object of non-empty strings, or undefined when it is absent. */
export const readStringRecord = (
  section: Record<string, unknown>,
  key: string,
  path: string,
): Record<string, string> | undefined => {
  const value = section[key];
  if (value === undefined) return undefined;
  if (isRecord(value) && Object.values(value).every((item) => typeof item === "string" && item)) {
    return value as Record<string, string>;
  }
  return failConfig(`${path}.${key}`, "an object of non-empty strings");
};

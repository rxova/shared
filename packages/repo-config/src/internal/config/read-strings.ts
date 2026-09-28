import { failConfig } from "@/internal/config/fail-config";

/** `section[key]` as an array of non-empty strings, or undefined when it is absent. */
export const readStrings = (
  section: Record<string, unknown>,
  key: string,
  path: string,
): string[] | undefined => {
  const value = section[key];
  if (value === undefined) return undefined;
  if (Array.isArray(value) && value.every((item) => typeof item === "string" && item !== "")) {
    return value as string[];
  }
  return failConfig(`${path}.${key}`, "an array of non-empty strings");
};

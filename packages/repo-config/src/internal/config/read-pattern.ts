import { failConfig } from "@/internal/config/fail-config";
import { readString } from "@/internal/config/read-string";

/**
 * `section[key]` as a regular expression source that compiles (with `flags`),
 * or undefined when it is absent. Checked when the config is read, so a typo
 * fails before any file is scanned.
 */
export const readPattern = (
  section: Record<string, unknown>,
  key: string,
  path: string,
  flags = "",
): string | undefined => {
  const source = readString(section, key, path);
  if (source === undefined) return undefined;
  try {
    new RegExp(source, flags);
  } catch (failure) {
    return failConfig(
      `${path}.${key}`,
      `a valid regular expression (${(failure as Error).message})`,
    );
  }
  return source;
};

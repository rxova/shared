import { assertOnlyKeys } from "@/internal/config/assert-only-keys";
import { failConfig } from "@/internal/config/fail-config";
import { isRecord } from "@/internal/config/is-record";

/**
 * `parent[key]` as an object holding only the `allowed` keys, or undefined
 * when it is absent. `path` names the parent in the error, as in
 * `repoConfig.changeset`.
 */
export const readSection = (
  parent: Record<string, unknown>,
  key: string,
  path: string,
  allowed: string[],
): Record<string, unknown> | undefined => {
  const value = parent[key];
  if (value === undefined) return undefined;
  const at = `${path}.${key}`;
  if (!isRecord(value)) return failConfig(at, "an object");
  assertOnlyKeys(value, at, allowed);
  return value;
};

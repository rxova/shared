import type { Git } from "@/scope/scope.types";

/**
 * The paths the range deleted, or undefined when that cannot be told: a `Git`
 * without `deleted`, or a git that fails. Undefined makes every documentation
 * change count as code, since a deleted README can break the checks that
 * expect it in a tarball.
 */
export const deletedPaths = (
  range: { base: string; head: string },
  run: Git,
): Set<string> | undefined => {
  if (!run.deleted) return undefined;
  try {
    return new Set(run.deleted(range.base, range.head));
  } catch {
    return undefined;
  }
};

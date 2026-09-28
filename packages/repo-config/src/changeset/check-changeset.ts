import { hasChangeset } from "@/internal/changeset/has-changeset";
import { SKIP_LABEL } from "@/internal/changeset/skip-label";
import { skipReason } from "@/internal/changeset/skip-reason";
import type { Request, Verdict } from "@/changeset/changeset.types";
import { touchesPackage } from "@/changeset/touches-package";

/**
 * Whether a pull request that changed a published package added a changeset,
 * or was excused from one. `changed` is every path the range touched;
 * `present` leaves out the deleted ones, and defaults to `changed` for callers
 * that have no deletions to tell apart.
 *
 * `shipped`, when given, replaces the code-only rule of `touchesPackage`: it
 * is the list of changed paths a published tarball ships (the `shipped`
 * scope), and the failure names them.
 */
export const checkChangeset = (
  changed: string[],
  published: string[],
  request: Request = {},
  { present = changed, shipped }: { present?: string[]; shipped?: string[] } = {},
): Verdict => {
  const touched = shipped === undefined ? touchesPackage(changed, published) : shipped.length > 0;
  if (!touched) {
    return { exitCode: 0, message: "check-changeset: no publishable change, nothing to require" };
  }
  const skip = skipReason(request);
  if (skip !== undefined) return { exitCode: 0, message: `check-changeset: ${skip}` };
  if (hasChangeset(present)) {
    return { exitCode: 0, message: "check-changeset: changeset present" };
  }
  return {
    exitCode: 1,
    message: [
      "check-changeset: this PR changes a published package but adds no changeset.",
      ...(shipped ?? []).map((file) => `  ${file}`),
      "",
      "Run `pnpm changeset` and commit the file it writes.",
      `If it publishes nothing — a dependency bump, say — label it \`${SKIP_LABEL}\`.`,
    ].join("\n"),
  };
};

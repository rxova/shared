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
 */
export const checkChangeset = (
  changed: string[],
  published: string[],
  request: Request = {},
  { present = changed }: { present?: string[] } = {},
): Verdict => {
  if (!touchesPackage(changed, published)) {
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
      "",
      "Run `pnpm changeset` and commit the file it writes.",
      `If it publishes nothing — a dependency bump, say — label it \`${SKIP_LABEL}\`.`,
    ].join("\n"),
  };
};

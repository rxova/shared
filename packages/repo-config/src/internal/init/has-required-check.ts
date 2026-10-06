import type { Repository, Tool } from "@/init/init.types";
import { REQUIRED_CHECK } from "@/internal/init/required-check";

/**
 * Whether the rules on the repository's default branch, its own rulesets and
 * the organisation's alike, already require the `all checks` status check.
 * False when `gh` cannot tell.
 */
export const hasRequiredCheck = (run: Tool, { owner, name }: Repository): boolean => {
  try {
    const branch = run("gh", [
      "repo",
      "view",
      "--json",
      "defaultBranchRef",
      "--jq",
      ".defaultBranchRef.name",
    ]);
    return run("gh", [
      "api",
      `repos/${owner}/${name}/rules/branches/${branch}`,
      "--jq",
      '.[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context',
    ])
      .split("\n")
      .includes(REQUIRED_CHECK);
  } catch {
    return false;
  }
};

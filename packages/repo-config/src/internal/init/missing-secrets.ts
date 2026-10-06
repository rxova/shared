import type { Tool } from "@/init/init.types";
import { RXOVA_APP_SECRETS } from "@/internal/init/app-secrets";
import type { MissingSecrets } from "@/internal/init/missing-secrets.types";

const reaching = (run: Tool, owner: string, kind: string): string[] =>
  run("gh", [
    "api",
    "--paginate",
    `orgs/${owner}/${kind}/secrets`,
    "--jq",
    '.secrets[] | select(.visibility == "all" or .visibility == "private") | .name',
  ]).split("\n");

/**
 * Which rxova-bot secrets of the owner organisation a new private repository
 * would not see, as Actions and as Dependabot secrets: two `gh api` calls.
 * `undefined` when `gh` cannot list them (listing needs the `admin:org` scope).
 */
export const missingSecrets = (run: Tool, owner: string): MissingSecrets | undefined => {
  try {
    const actions = reaching(run, owner, "actions");
    const dependabot = reaching(run, owner, "dependabot");
    return {
      actions: RXOVA_APP_SECRETS.filter((secret) => !actions.includes(secret)),
      dependabot: RXOVA_APP_SECRETS.filter((secret) => !dependabot.includes(secret)),
    };
  } catch {
    return undefined;
  }
};

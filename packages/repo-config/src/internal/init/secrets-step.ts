import { RXOVA_APP_SECRETS } from "@/internal/init/app-secrets";
import type { MissingSecrets } from "@/internal/init/missing-secrets.types";

/**
 * The lines of the secrets step, unnumbered: nothing when every secret reaches
 * the repository, only the missing ones when some do, all of them when none do
 * or `gh` could not tell (`undefined`).
 */
export const secretsStep = (missing: MissingSecrets | undefined): string[] => {
  const all = RXOVA_APP_SECRETS.length;
  if (
    missing === undefined ||
    (missing.actions.length === all && missing.dependabot.length === all)
  ) {
    return [
      `give the repository the organisation secrets ${RXOVA_APP_SECRETS.join(" and ")},`,
      "both as Actions secrets and as Dependabot secrets",
    ];
  }
  if (missing.actions.length === 0 && missing.dependabot.length === 0) return [];
  return [
    "give the repository these organisation secrets:",
    ...(missing.actions.length > 0 ? [`Actions: ${missing.actions.join(", ")}`] : []),
    ...(missing.dependabot.length > 0 ? [`Dependabot: ${missing.dependabot.join(", ")}`] : []),
  ];
};

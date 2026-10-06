import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { RXOVA_APP_SLUG } from "@/internal/init/app-slug";

/** The manual step for the rxova-bot installation, when init could not take it. */
export const appInstallationSteps = (
  { owner, name }: Repository,
  app: AppInstallationStep,
): string[] => {
  if (app.step === "done") return [];
  if (app.step === "install") {
    return [
      `  -  install ${RXOVA_APP_SLUG} on ${owner} with "Only select repositories" and include ${owner}/${name}`,
    ];
  }
  const page = `https://github.com/organizations/${owner}/settings/installations${
    app.installationId === undefined ? "" : `/${app.installationId}`
  }`;
  return [
    `  -  Add ${owner}/${name} to the ${RXOVA_APP_SLUG} installation: ${page} → Repository access → Select repositories`,
    "     (a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
  ];
};

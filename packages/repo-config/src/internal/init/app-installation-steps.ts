import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { RXOVA_APP_SLUG } from "@/internal/init/app-slug";
import { installationPage } from "@/internal/init/installation-page";

/** The lines of the manual step for the rxova-bot installation, unnumbered; none when init took it. */
export const appInstallationSteps = (
  { owner, name }: Repository,
  app: AppInstallationStep,
): string[] => {
  if (app.step === "done") return [];
  if (app.step === "install") {
    return [
      `install ${RXOVA_APP_SLUG} on ${owner} with "Only select repositories" and include ${owner}/${name}`,
    ];
  }
  return [
    `add ${owner}/${name} to the ${RXOVA_APP_SLUG} installation: ${installationPage(owner, app.installationId)} → Repository access → Select repositories`,
    "(a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
  ];
};

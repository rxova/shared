import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { installationPage } from "@/internal/init/installation-page";

/** The lines of the manual step for the `appSlug` installation, unnumbered; none when init took it. */
export const appInstallationSteps = (
  { owner, name }: Repository,
  appSlug: string,
  app: AppInstallationStep,
): string[] => {
  if (app.step === "done") return [];
  if (app.step === "install") {
    return [
      `install ${appSlug} on ${owner} with "Only select repositories" and include ${owner}/${name}`,
    ];
  }
  return [
    `add ${owner}/${name} to the ${appSlug} installation: ${installationPage(owner, app.installationId)} → Repository access → Select repositories`,
    "(a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
  ];
};

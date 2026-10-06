import type { Repository, Tool } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { installationPage } from "@/internal/init/installation-page";
import { openInBrowser } from "@/internal/init/open-in-browser";

/**
 * Opens the settings page of the installation init could not add `target` to,
 * under the rules of `openInBrowser`, and says so. Does nothing unless `app`
 * is a `configure` step with a known installation.
 */
export const openInstallationPage = (
  run: Tool,
  target: Repository,
  app: AppInstallationStep,
  browser: Parameters<typeof openInBrowser>[2],
): void => {
  if (app.step !== "configure" || app.installationId === undefined) return;
  const page = installationPage(target.owner, app.installationId);
  if (openInBrowser(run, page, browser)) {
    console.log(
      `init: opened ${page} — add ${target.owner}/${target.name} under Repository access`,
    );
  }
};

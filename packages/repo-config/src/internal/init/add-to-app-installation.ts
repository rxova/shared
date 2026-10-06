import type { Repository, Tool } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { RXOVA_APP_SLUG } from "@/internal/init/app-slug";

/**
 * Adds a private repository to the rxova-bot installation on its owner
 * organisation, so the app's tokens reach it. An installation on all
 * repositories already covers it. Never throws: when `gh` cannot find the
 * installation or refuses the change, it says so and returns the step the user
 * has to take. GitHub refuses the change to a plain `gh` OAuth login (HTTP 403);
 * a classic personal access token with `repo` scope in `GH_TOKEN` is accepted.
 * A dry run reads the installation but changes nothing.
 */
export const addToAppInstallation = (
  run: Tool,
  { owner, name }: Repository,
  dryRun: boolean,
): AppInstallationStep => {
  const repository = `${owner}/${name}`;
  let installation: string;
  try {
    installation = run("gh", [
      "api",
      `/orgs/${owner}/installations`,
      "--jq",
      `.installations[] | select(.app_slug == "${RXOVA_APP_SLUG}") | [.id, .repository_selection] | @tsv`,
    ]);
  } catch {
    console.log(`init: could not read the app installations of ${owner}; do it by hand (below)`);
    return { step: "configure", installationId: undefined };
  }
  const tab = installation.indexOf("\t");
  if (tab < 1) {
    console.log(`init: ${RXOVA_APP_SLUG} is not installed on ${owner}; do it by hand (below)`);
    return { step: "install" };
  }
  const id = installation.slice(0, tab);
  if (installation.slice(tab + 1) === "all") {
    console.log(`init: the ${RXOVA_APP_SLUG} installation already covers every repository`);
    return { step: "done" };
  }
  if (dryRun) {
    console.log(`init: would add ${repository} to the ${RXOVA_APP_SLUG} installation`);
    return { step: "done" };
  }
  try {
    const repositoryId = run("gh", ["api", `repos/${repository}`, "--jq", ".id"]);
    run("gh", ["api", "-X", "PUT", `/user/installations/${id}/repositories/${repositoryId}`]);
  } catch {
    console.log(
      `init: could not add ${repository} to the ${RXOVA_APP_SLUG} installation; do it by hand (below)`,
    );
    return { step: "configure", installationId: id };
  }
  console.log(`init: added ${repository} to the ${RXOVA_APP_SLUG} installation`);
  return { step: "done" };
};

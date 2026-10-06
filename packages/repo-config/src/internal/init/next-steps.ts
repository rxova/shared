import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { appInstallationSteps } from "@/internal/init/app-installation-steps";
import { RENOVATE_APP_SLUG } from "@/internal/init/app-slug";
import { numberedSteps } from "@/internal/init/numbered-steps";

/**
 * What `init` left for a public repository, numbered: the commit, Pages when
 * init could not turn it on, the renovate installation when init could not add
 * the repository to it (`app`), and the steps that need the npm and Codecov
 * websites.
 */
export const nextSteps = (
  target: Repository,
  { pages, app }: { pages: boolean; app: AppInstallationStep },
): string[] =>
  numberedSteps([
    ["pnpm install, then review `git diff` and commit"],
    pages ? [] : ["Pages: Settings → Pages → Source: GitHub Actions (the Docs workflow waits)"],
    appInstallationSteps(target, RENOVATE_APP_SLUG, app),
    [
      "npm: publish the first version by hand (`npm publish --access public` in the package),",
      `add a trusted publisher on npmjs.com (repository ${target.owner}/${target.name}, workflow release.yml),`,
      "then set the repository variable RELEASE_ENABLED to true",
    ],
    ["optional: a CODECOV_TOKEN secret for coverage comments"],
  ]);

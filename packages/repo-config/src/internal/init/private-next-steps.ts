import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { appInstallationSteps } from "@/internal/init/app-installation-steps";

/**
 * What `init` cannot do for a private repository: the secrets its workflows
 * read and the required check, which need an organisation owner. `settings` is
 * false when init could not turn on auto-merge and branch deletion itself;
 * `app` says what is left of adding the repository to the rxova-bot installation.
 */
export const privateNextSteps = (
  target: Repository,
  settings: boolean,
  app: AppInstallationStep,
): string[] => [
  "next:",
  "  1. pnpm install, then review `git diff` and commit",
  ...(settings
    ? []
    : [
        "  -  settings: Settings → General → allow auto-merge and automatically delete head branches",
      ]),
  ...appInstallationSteps(target, app),
  "  2. give the repository the organisation secrets RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY,",
  "     both as Actions secrets and as Dependabot secrets",
  "  3. require the status check `all checks` on the default branch",
];

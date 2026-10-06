import type { Repository } from "@/init/init.types";
import type { AppInstallationStep } from "@/internal/init/app-installation.types";
import { appInstallationSteps } from "@/internal/init/app-installation-steps";
import { RXOVA_APP_SLUG } from "@/internal/init/app-slug";
import type { MissingSecrets } from "@/internal/init/missing-secrets.types";
import { numberedSteps } from "@/internal/init/numbered-steps";
import { REQUIRED_CHECK } from "@/internal/init/required-check";
import { secretsStep } from "@/internal/init/secrets-step";

/**
 * What `init` left for a private repository, numbered: only the steps still
 * open. `settings` is false when init could not turn on auto-merge and branch
 * deletion; `app` says what is left of the rxova-bot installation; `secrets`
 * names the organisation secrets that do not reach the repository (`undefined`
 * when unknown); `requiredCheck` is true when the default branch already
 * requires `all checks`.
 */
export const privateNextSteps = (
  target: Repository,
  {
    settings,
    app,
    secrets,
    requiredCheck,
  }: {
    settings: boolean;
    app: AppInstallationStep;
    secrets: MissingSecrets | undefined;
    requiredCheck: boolean;
  },
): string[] =>
  numberedSteps([
    ["pnpm install, then review `git diff` and commit"],
    settings
      ? []
      : ["settings: Settings → General → allow auto-merge and automatically delete head branches"],
    appInstallationSteps(target, RXOVA_APP_SLUG, app),
    secretsStep(secrets),
    requiredCheck ? [] : [`require the status check \`${REQUIRED_CHECK}\` on the default branch`],
  ]);

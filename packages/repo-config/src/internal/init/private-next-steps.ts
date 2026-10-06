import type { Repository } from "@/init/init.types";

/**
 * What `init` cannot do for a private repository: the GitHub App, the
 * secrets its workflows read and the required check, which all need an
 * organisation owner. `settings` is false when init could not turn on
 * auto-merge and branch deletion itself.
 */
export const privateNextSteps = ({ owner, name }: Repository, settings: boolean): string[] => [
  "next:",
  "  1. pnpm install, then review `git diff` and commit",
  ...(settings
    ? []
    : [
        "  -  settings: Settings → General → allow auto-merge and automatically delete head branches",
      ]),
  `  2. install the rxova GitHub App on ${owner}/${name}`,
  "  3. give the repository the organisation secrets RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY,",
  "     both as Actions secrets and as Dependabot secrets",
  "  4. require the status check `all checks` on the default branch",
];

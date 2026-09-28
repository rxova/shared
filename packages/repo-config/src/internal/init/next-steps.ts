import type { Repository } from "@/init/init.types";

/** What `init` cannot do: the steps that need the npm and Codecov websites, or a review. */
export const nextSteps = ({ owner, name }: Repository, pages: boolean): string[] => [
  "next:",
  "  1. pnpm install, then review `git diff` and commit",
  ...(pages
    ? []
    : ["  -  Pages: Settings → Pages → Source: GitHub Actions (the Docs workflow waits)"]),
  "  2. npm: publish the first version by hand (`npm publish --access public` in the package),",
  `     add a trusted publisher on npmjs.com (repository ${owner}/${name}, workflow release.yml),`,
  "     then set the repository variable RELEASE_ENABLED to true",
  "  3. optional: a CODECOV_TOKEN secret for coverage comments",
];

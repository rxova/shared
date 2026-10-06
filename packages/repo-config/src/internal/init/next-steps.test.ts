import { describe, expect, it } from "vitest";
import { nextSteps } from "@/internal/init/next-steps";

const TARGET = { owner: "ada", name: "idea" };
const DONE = { step: "done" } as const;

describe("nextSteps", () => {
  it("names the repository for the npm trusted publisher", () => {
    expect(nextSteps(TARGET, { pages: true, app: DONE }).join("\n")).toContain(
      "repository ada/idea, workflow release.yml",
    );
  });

  it("numbers the commit, npm and Codecov steps when init did the rest", () => {
    expect(nextSteps(TARGET, { pages: true, app: DONE })).toEqual([
      "next:",
      "  1. pnpm install, then review `git diff` and commit",
      "  2. npm: publish the first version by hand (`npm publish --access public` in the package),",
      "     add a trusted publisher on npmjs.com (repository ada/idea, workflow release.yml),",
      "     then set the repository variable RELEASE_ENABLED to true",
      "  3. optional: a CODECOV_TOKEN secret for coverage comments",
    ]);
  });

  it("numbers the Pages and renovate steps in order when init could not take them", () => {
    expect(
      nextSteps(TARGET, { pages: false, app: { step: "configure", installationId: "88" } }),
    ).toEqual([
      "next:",
      "  1. pnpm install, then review `git diff` and commit",
      "  2. Pages: Settings → Pages → Source: GitHub Actions (the Docs workflow waits)",
      "  3. add ada/idea to the renovate installation: https://github.com/organizations/ada/settings/installations/88 → Repository access → Select repositories",
      "     (a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
      "  4. npm: publish the first version by hand (`npm publish --access public` in the package),",
      "     add a trusted publisher on npmjs.com (repository ada/idea, workflow release.yml),",
      "     then set the repository variable RELEASE_ENABLED to true",
      "  5. optional: a CODECOV_TOKEN secret for coverage comments",
    ]);
  });

  it("asks to install renovate when the organisation has no installation", () => {
    expect(nextSteps(TARGET, { pages: true, app: { step: "install" } })).toContain(
      '  2. install renovate on ada with "Only select repositories" and include ada/idea',
    );
  });

  it("adds the Pages step only when init could not do it", () => {
    expect(nextSteps(TARGET, { pages: true, app: DONE }).join("\n")).not.toContain("Pages");
    expect(nextSteps(TARGET, { pages: false, app: DONE }).join("\n")).toContain("Pages");
  });
});

import { describe, expect, it } from "vitest";
import { privateNextSteps } from "@/internal/init/private-next-steps";

const TARGET = { owner: "ada", name: "idea" };
const DONE = { step: "done" } as const;
const OPEN = { settings: true, app: DONE, secrets: undefined, requiredCheck: false };
const READY = {
  settings: true,
  app: DONE,
  secrets: { actions: [], dependabot: [] },
  requiredCheck: true,
};

describe("privateNextSteps", () => {
  it("names the secrets and the required check, and nothing about npm or the app", () => {
    const steps = privateNextSteps(TARGET, OPEN).join("\n");
    expect(steps).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(steps).toContain("Actions secrets and as Dependabot secrets");
    expect(steps).toContain("`all checks`");
    expect(steps).not.toContain("GitHub App");
    expect(steps).not.toContain("rxova-bot");
    expect(steps).not.toContain("npmjs.com");
    expect(steps).not.toContain("trusted publisher");
    expect(steps).not.toContain("Settings → General");
  });

  it("leaves only the commit when everything is set up", () => {
    expect(privateNextSteps(TARGET, READY)).toEqual([
      "next:",
      "  1. pnpm install, then review `git diff` and commit",
    ]);
  });

  it("numbers every open step in order, the app step included", () => {
    expect(
      privateNextSteps(TARGET, {
        settings: false,
        app: { step: "configure", installationId: "77" },
        secrets: { actions: [], dependabot: ["RXOVA_APP_ID"] },
        requiredCheck: false,
      }),
    ).toEqual([
      "next:",
      "  1. pnpm install, then review `git diff` and commit",
      "  2. settings: Settings → General → allow auto-merge and automatically delete head branches",
      "  3. add ada/idea to the rxova-bot installation: https://github.com/organizations/ada/settings/installations/77 → Repository access → Select repositories",
      "     (a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
      "  4. give the repository these organisation secrets:",
      "     Dependabot: RXOVA_APP_ID",
      "  5. require the status check `all checks` on the default branch",
    ]);
  });

  it("asks to install the app when the organisation has no installation", () => {
    expect(privateNextSteps(TARGET, { ...READY, app: { step: "install" } }).join("\n")).toContain(
      '  2. install rxova-bot on ada with "Only select repositories" and include ada/idea',
    );
  });

  it("links the installations page when init could not read the installation", () => {
    expect(
      privateNextSteps(TARGET, {
        ...READY,
        app: { step: "configure", installationId: undefined },
      }).join("\n"),
    ).toContain("https://github.com/organizations/ada/settings/installations →");
  });
});

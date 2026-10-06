import { describe, expect, it } from "vitest";
import { privateNextSteps } from "@/internal/init/private-next-steps";

const TARGET = { owner: "ada", name: "idea" };
const DONE = { step: "done" } as const;

describe("privateNextSteps", () => {
  it("names the secrets and the required check, and nothing about npm or the app", () => {
    const steps = privateNextSteps(TARGET, true, DONE).join("\n");
    expect(steps).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(steps).toContain("Actions secrets and as Dependabot secrets");
    expect(steps).toContain("`all checks`");
    expect(steps).not.toContain("GitHub App");
    expect(steps).not.toContain("rxova-bot");
    expect(steps).not.toContain("npmjs.com");
    expect(steps).not.toContain("trusted publisher");
    expect(steps).not.toContain("Settings → General");
  });

  it("adds the settings step only when init could not do it", () => {
    expect(privateNextSteps(TARGET, false, DONE).join("\n")).toContain("Settings → General");
  });

  it("asks to install the app when the organisation has no installation", () => {
    expect(privateNextSteps(TARGET, true, { step: "install" }).join("\n")).toContain(
      'install rxova-bot on ada with "Only select repositories" and include ada/idea',
    );
  });

  it("links the installation to configure when init could not add the repository", () => {
    const steps = privateNextSteps(TARGET, true, {
      step: "configure",
      installationId: "77",
    }).join("\n");
    expect(steps).toContain(
      "Add ada/idea to the rxova-bot installation: https://github.com/organizations/ada/settings/installations/77 → Repository access → Select repositories",
    );
    expect(steps).toContain("classic personal access token with `repo` scope in GH_TOKEN");
  });

  it("links the installations page when init could not read the installation", () => {
    expect(
      privateNextSteps(TARGET, true, { step: "configure", installationId: undefined }).join("\n"),
    ).toContain("https://github.com/organizations/ada/settings/installations →");
  });
});

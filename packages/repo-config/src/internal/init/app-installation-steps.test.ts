import { describe, expect, it } from "vitest";
import { appInstallationSteps } from "@/internal/init/app-installation-steps";

const TARGET = { owner: "ada", name: "idea" };

describe("appInstallationSteps", () => {
  it("is empty when init took care of it", () => {
    expect(appInstallationSteps(TARGET, { step: "done" })).toEqual([]);
  });

  it("asks to install the app on the organisation", () => {
    expect(appInstallationSteps(TARGET, { step: "install" })).toEqual([
      'install rxova-bot on ada with "Only select repositories" and include ada/idea',
    ]);
  });

  it("links the installation and names the token that lets init do it", () => {
    expect(appInstallationSteps(TARGET, { step: "configure", installationId: "77" })).toEqual([
      "add ada/idea to the rxova-bot installation: https://github.com/organizations/ada/settings/installations/77 → Repository access → Select repositories",
      "(a classic personal access token with `repo` scope in GH_TOKEN lets init do it)",
    ]);
  });

  it("links the installations page when the installation is unknown", () => {
    expect(
      appInstallationSteps(TARGET, { step: "configure", installationId: undefined })[0],
    ).toContain("/settings/installations → Repository access");
  });
});

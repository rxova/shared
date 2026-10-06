import { describe, expect, it } from "vitest";
import { installationPage } from "@/internal/init/installation-page";

describe("installationPage", () => {
  it("links one installation", () => {
    expect(installationPage("ada", "77")).toBe(
      "https://github.com/organizations/ada/settings/installations/77",
    );
  });

  it("links all installations when the id is unknown", () => {
    expect(installationPage("ada", undefined)).toBe(
      "https://github.com/organizations/ada/settings/installations",
    );
  });
});

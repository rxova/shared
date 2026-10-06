import { describe, expect, it } from "vitest";
import { privateNextSteps } from "@/internal/init/private-next-steps";

describe("privateNextSteps", () => {
  it("names the app, the secrets and the required check, and nothing about npm", () => {
    const steps = privateNextSteps({ owner: "ada", name: "idea" }, true).join("\n");
    expect(steps).toContain("install the rxova GitHub App on ada/idea");
    expect(steps).toContain("RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY");
    expect(steps).toContain("Actions secrets and as Dependabot secrets");
    expect(steps).toContain("`all checks`");
    expect(steps).not.toContain("npmjs.com");
    expect(steps).not.toContain("trusted publisher");
    expect(steps).not.toContain("Settings → General");
  });

  it("adds the settings step only when init could not do it", () => {
    expect(privateNextSteps({ owner: "a", name: "b" }, false).join("\n")).toContain(
      "Settings → General",
    );
  });
});

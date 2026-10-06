import { describe, expect, it } from "vitest";
import { secretsStep } from "@/internal/init/secrets-step";

const BOTH = ["RXOVA_APP_ID", "RXOVA_APP_PRIVATE_KEY"];

describe("secretsStep", () => {
  it("is empty when every secret reaches the repository", () => {
    expect(secretsStep({ actions: [], dependabot: [] })).toEqual([]);
  });

  it("names every secret when gh could not tell", () => {
    expect(secretsStep(undefined)).toEqual([
      "give the repository the organisation secrets RXOVA_APP_ID and RXOVA_APP_PRIVATE_KEY,",
      "both as Actions secrets and as Dependabot secrets",
    ]);
  });

  it("names every secret when none reaches the repository", () => {
    expect(secretsStep({ actions: BOTH, dependabot: BOTH })).toEqual(secretsStep(undefined));
  });

  it("names only the missing ones, per kind", () => {
    expect(secretsStep({ actions: [], dependabot: BOTH })).toEqual([
      "give the repository these organisation secrets:",
      "Dependabot: RXOVA_APP_ID, RXOVA_APP_PRIVATE_KEY",
    ]);
    expect(secretsStep({ actions: ["RXOVA_APP_PRIVATE_KEY"], dependabot: [] })).toEqual([
      "give the repository these organisation secrets:",
      "Actions: RXOVA_APP_PRIVATE_KEY",
    ]);
  });
});

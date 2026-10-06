import { describe, expect, it } from "vitest";
import type { Tool } from "@/init/init.types";
import { missingSecrets } from "@/internal/init/missing-secrets";

const JQ = '.secrets[] | select(.visibility == "all" or .visibility == "private") | .name';

describe("missingSecrets", () => {
  it("lists the organisation's Actions and Dependabot secrets that reach private repositories", () => {
    const calls: string[] = [];
    const run: Tool = (command, args) => {
      calls.push([command, ...args].join(" "));
      return "RXOVA_APP_ID\nRXOVA_APP_PRIVATE_KEY\nNPM_TOKEN";
    };
    expect(missingSecrets(run, "ada")).toEqual({ actions: [], dependabot: [] });
    expect(calls).toEqual([
      `gh api --paginate orgs/ada/actions/secrets --jq ${JQ}`,
      `gh api --paginate orgs/ada/dependabot/secrets --jq ${JQ}`,
    ]);
  });

  it("names the secrets that are absent or not visible to private repositories", () => {
    const run: Tool = (_command, args) =>
      args.includes("orgs/ada/actions/secrets") ? "RXOVA_APP_ID" : "";
    expect(missingSecrets(run, "ada")).toEqual({
      actions: ["RXOVA_APP_PRIVATE_KEY"],
      dependabot: ["RXOVA_APP_ID", "RXOVA_APP_PRIVATE_KEY"],
    });
  });

  it("is undefined when gh cannot list them", () => {
    const run: Tool = () => {
      throw new Error("HTTP 403: requires admin:org");
    };
    expect(missingSecrets(run, "ada")).toBeUndefined();
  });
});

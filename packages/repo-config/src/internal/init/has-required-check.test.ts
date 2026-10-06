import { describe, expect, it } from "vitest";
import type { Tool } from "@/init/init.types";
import { hasRequiredCheck } from "@/internal/init/has-required-check";

const TARGET = { owner: "ada", name: "idea" };

const fake = (contexts: () => string) => {
  const calls: string[] = [];
  const run: Tool = (command, args) => {
    calls.push([command, ...args].join(" "));
    return args[0] === "repo" ? "main" : contexts();
  };
  return { calls, run };
};

describe("hasRequiredCheck", () => {
  it("finds `all checks` among the required status checks of the default branch", () => {
    const { calls, run } = fake(() => "lint\nall checks");
    expect(hasRequiredCheck(run, TARGET)).toBe(true);
    expect(calls).toEqual([
      "gh repo view --json defaultBranchRef --jq .defaultBranchRef.name",
      'gh api repos/ada/idea/rules/branches/main --jq .[] | select(.type == "required_status_checks") | .parameters.required_status_checks[].context',
    ]);
  });

  it("is false when no rule requires it", () => {
    expect(hasRequiredCheck(fake(() => "").run, TARGET)).toBe(false);
    expect(hasRequiredCheck(fake(() => "all checks (lean)").run, TARGET)).toBe(false);
  });

  it("is false when gh fails", () => {
    const { run } = fake(() => {
      throw new Error("HTTP 404");
    });
    expect(hasRequiredCheck(run, TARGET)).toBe(false);
  });
});

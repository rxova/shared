import { describe, expect, it } from "vitest";
import { filterSteps } from "@/verify/filter-steps";

const lint = { name: "lint", command: "pnpm lint" };
const tests = { name: "unit tests", command: "pnpm exec turbo run test", split: {} };

describe("filterSteps", () => {
  it("keeps every step as it is without --filter", () => {
    const steps = [lint, tests];
    expect(filterSteps(steps, [])).toBe(steps);
  });

  it("filters the split steps to the packages, in either flag spelling", () => {
    expect(filterSteps([lint, tests], ["--filter", "@repo/core,web"])).toEqual([
      lint,
      { ...tests, command: "pnpm exec turbo run test --filter=@repo/core --filter=web" },
    ]);
    expect(filterSteps([tests], ["--filter=//"])[0]?.command).toBe(
      "pnpm exec turbo run test --filter=//",
    );
  });

  it("refuses a name a shell would read as more than a name", () => {
    expect(() => filterSteps([tests], ["--filter", "core;rm -rf /,ui"])).toThrow(
      "not a package name: core;rm -rf /",
    );
    expect(() => filterSteps([tests], ["--filter=$(id)"])).toThrow("not a package name");
  });

  it("refuses a filter no split step takes", () => {
    expect(() => filterSteps([lint], ["--filter", "core"])).toThrow(
      "--filter needs a step with `split`",
    );
  });
});

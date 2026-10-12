import { describe, expect, it } from "vitest";
import { planSteps } from "@/verify/plan-steps";

const noDryRun = () => {
  throw new Error("no step is split");
};

describe("planSteps", () => {
  it("makes a job of each step, in list order", () => {
    const steps = [
      { name: "lint", command: "pnpm lint" },
      { name: "build", command: "pnpm build" },
    ];
    expect(planSteps(steps, noDryRun)).toEqual([
      { name: "lint", only: "lint", filter: "" },
      { name: "build", only: "build", filter: "" },
    ]);
  });

  it("makes one job of a group, where its first step stands", () => {
    const steps = [
      { name: "format", command: "pnpm format:check", group: "static" },
      { name: "lint", command: "pnpm lint" },
      { name: "knip", command: "pnpm knip", group: "static" },
      { name: "build", command: "pnpm build", group: "build" },
      { name: "audit", command: "pnpm audit", group: "static" },
    ];
    expect(planSteps(steps, noDryRun)).toEqual([
      { name: "static", only: "format,knip,audit", filter: "" },
      { name: "lint", only: "lint", filter: "" },
      { name: "build", only: "build", filter: "" },
    ]);
  });

  it("deals a split step into its jobs from turbo's dry run", () => {
    const tasks = ["core", "ui"].map((name) => ({
      task: "test",
      package: name,
      cache: { status: "MISS" },
      inputs: { "a.ts": "h" },
    }));
    const steps = [
      { name: "lint", command: "pnpm lint" },
      { name: "unit tests", command: "turbo run test", split: {} },
    ];
    expect(planSteps(steps, () => JSON.stringify({ tasks }))).toEqual([
      { name: "lint", only: "lint", filter: "" },
      { name: "unit tests · core", only: "unit tests", filter: "core" },
      { name: "unit tests · ui", only: "unit tests", filter: "ui" },
    ]);
  });

  it("fails when turbo's dry run does", () => {
    const steps = [{ name: "unit tests", command: "turbo run test", split: {} }];
    expect(() => planSteps(steps, noDryRun)).toThrow("no step is split");
  });
});

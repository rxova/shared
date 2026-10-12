import { describe, expect, it } from "vitest";
import { splitLegs } from "@/internal/verify/split-legs";

const task = (pkg: string, status: "HIT" | "MISS", inputs: number) => ({
  task: "test",
  package: pkg,
  command: "vitest run",
  cache: { status },
  inputs: Object.fromEntries(Array.from({ length: inputs }, (_, i) => [String(i), "h"])),
});
const dryRun =
  (...tasks: unknown[]) =>
  (command: string) => {
    expect(command).toBe("pnpm exec turbo run test");
    return JSON.stringify({ tasks });
  };
const step = { name: "unit tests", command: "pnpm exec turbo run test", split: {} };

describe("splitLegs", () => {
  it("is one job replaying the cache when nothing misses", () => {
    const whole = [{ name: "unit tests", only: "unit tests", filter: "" }];
    expect(splitLegs(step, {}, dryRun(task("core", "HIT", 3)))).toEqual(whole);
    expect(splitLegs(step, {}, dryRun())).toEqual(whole);
  });

  it("deals the misses into at most max jobs and adds the hits to the lightest", () => {
    const run = dryRun(
      task("web", "MISS", 30),
      task("core", "MISS", 20),
      task("ui", "MISS", 15),
      task("db", "MISS", 10),
      task("tokens", "HIT", 50),
      task("auth", "HIT", 5),
    );
    expect(splitLegs(step, { max: 2 }, run)).toEqual([
      { name: "unit tests · web +1", only: "unit tests", filter: "web,db" },
      { name: "unit tests · core +3", only: "unit tests", filter: "core,ui,auth,tokens" },
    ]);
  });

  it("runs one job per miss below the default of eight", () => {
    const run = dryRun(task("core", "MISS", 2), task("ui", "MISS", 2), task("db", "HIT", 1));
    expect(splitLegs(step, {}, run)).toEqual([
      { name: "unit tests · core +1", only: "unit tests", filter: "core,db" },
      { name: "unit tests · ui", only: "unit tests", filter: "ui" },
    ]);
  });
});

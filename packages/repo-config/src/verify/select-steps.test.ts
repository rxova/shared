import { describe, expect, it } from "vitest";
import { selectSteps } from "@/verify/select-steps";

const step = (name: string) => ({ name, command: `echo ${name}` });
const steps = [step("lint"), step("build"), step("test")];

describe("selectSteps", () => {
  it("keeps every step without --only", () => {
    expect(selectSteps(steps, [])).toBe(steps);
  });

  it("keeps the named steps in list order, in either flag spelling", () => {
    expect(selectSteps(steps, ["--only", "test,lint"]).map(({ name }) => name)).toEqual([
      "lint",
      "test",
    ]);
    expect(selectSteps(steps, ["--only=build"]).map(({ name }) => name)).toEqual(["build"]);
  });

  it("refuses an empty list", () => {
    expect(() => selectSteps(steps, ["--only"])).toThrow("comma-separated list");
    expect(() => selectSteps(steps, ["--only=, "])).toThrow("comma-separated list");
  });

  it("refuses an unknown name rather than running nothing", () => {
    expect(() => selectSteps(steps, ["--only", "lnt"])).toThrow(
      "unknown step(s): lnt; the steps are lint, build, test",
    );
  });
});

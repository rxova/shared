import { describe, expect, it } from "vitest";
import { parseSteps } from "@/internal/config/parse-steps";

describe("parseSteps", () => {
  it("reads name and command pairs, and nothing else from them", () => {
    expect(parseSteps([{ name: "lint", command: "pnpm lint", extra: 1 }])).toEqual([
      { name: "lint", command: "pnpm lint" },
    ]);
    expect(parseSteps([])).toEqual([]);
  });

  it("keeps skipOnRelease when it is set", () => {
    expect(
      parseSteps([
        { name: "audit", command: "pnpm audit", skipOnRelease: true },
        { name: "lint", command: "pnpm lint", skipOnRelease: false },
      ]),
    ).toEqual([
      { name: "audit", command: "pnpm audit", skipOnRelease: true },
      { name: "lint", command: "pnpm lint", skipOnRelease: false },
    ]);
  });

  it("refuses a skipOnRelease that is not a boolean", () => {
    expect(() => parseSteps([{ name: "a", command: "b", skipOnRelease: "yes" }])).toThrow(
      "repoConfig.verify.steps[0].skipOnRelease must be a boolean",
    );
  });

  it("keeps a group, and a split with true read as {}", () => {
    expect(
      parseSteps([
        { name: "format", command: "pnpm format:check", group: "static" },
        { name: "unit tests", command: "pnpm exec turbo run test", split: true },
        { name: "typecheck", command: "turbo run typecheck --cache=local:r", split: { max: 4 } },
      ]),
    ).toEqual([
      { name: "format", command: "pnpm format:check", group: "static" },
      { name: "unit tests", command: "pnpm exec turbo run test", split: {} },
      { name: "typecheck", command: "turbo run typecheck --cache=local:r", split: { max: 4 } },
    ]);
  });

  it("refuses a group that is not a non-empty string", () => {
    expect(() => parseSteps([{ name: "a", command: "b", group: "" }])).toThrow(
      "repoConfig.verify.steps[0].group must be a non-empty string",
    );
  });

  it("refuses a split of a command that runs no turbo task", () => {
    expect(() => parseSteps([{ name: "unit tests", command: "pnpm test", split: true }])).toThrow(
      "repoConfig.verify.steps[0].split must be on a step whose command runs `turbo run <task>`",
    );
  });

  it("refuses a step both grouped and split", () => {
    expect(() =>
      parseSteps([{ name: "t", command: "turbo run test", split: true, group: "g" }]),
    ).toThrow("repoConfig.verify.steps[0] must be either in a group or split, not both");
  });

  it("refuses anything but an array", () => {
    expect(() => parseSteps({})).toThrow("repoConfig.verify.steps must be an array");
  });

  it.each([
    [{ name: "x" }],
    [{ name: "", command: "x" }],
    [{ name: "x", command: "" }],
    ["pnpm lint"],
  ])("refuses the step %j, by position", (step) => {
    expect(() => parseSteps([{ name: "ok", command: "ok" }, step])).toThrow(
      "repoConfig.verify.steps[1] must be a { name, command } pair of strings",
    );
  });
});

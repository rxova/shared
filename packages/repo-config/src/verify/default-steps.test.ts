import { describe, expect, it } from "vitest";
import { defaultSteps } from "@/verify/default-steps";

describe("defaultSteps", () => {
  it("is the list CI runs, in the order CI runs it", () => {
    expect(defaultSteps().map(({ name }) => name)).toEqual([
      "lint",
      "format",
      "build",
      "typecheck",
      "unit tests",
      "package exports",
      "pack smoke",
      "dependency versions",
      "unused code",
      "dependency dedupe",
      "audit",
    ]);
  });

  it("hands out a fresh list each time, so a caller cannot edit the default", () => {
    expect(defaultSteps()).not.toBe(defaultSteps());
  });
});

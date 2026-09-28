import { describe, expect, it } from "vitest";
import { coverageBlock } from "@/internal/vitest/coverage-block";

const options = {
  reporter: ["text"],
  include: ["src/**/*.ts"],
  exclude: ["src/cli.ts"],
  thresholds: {},
  reportsDirectory: undefined,
};

describe("coverageBlock", () => {
  it("measures with v8, leaves barrels, types, tests and fixtures out, and enforces 95 per file", () => {
    expect(coverageBlock(options)).toEqual({
      provider: "v8",
      reporter: ["text"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*.fixtures.{ts,tsx}",
        "src/**/*.types.ts",
        "src/index.ts",
        "src/cli.ts",
      ],
      thresholds: { perFile: true, statements: 95, branches: 95, functions: 95, lines: 95 },
    });
  });

  it("changes only the axes a package names", () => {
    expect(coverageBlock({ ...options, thresholds: { branches: 80 } })).toMatchObject({
      thresholds: { perFile: true, statements: 95, branches: 80, functions: 95, lines: 95 },
    });
  });

  it("reports without enforcing when thresholds is false", () => {
    expect(coverageBlock({ ...options, thresholds: false })).not.toHaveProperty("thresholds");
  });

  it("writes reports where the package says", () => {
    expect(coverageBlock({ ...options, reportsDirectory: "coverage/core" })).toMatchObject({
      reportsDirectory: "coverage/core",
    });
    expect(coverageBlock(options)).not.toHaveProperty("reportsDirectory");
  });
});

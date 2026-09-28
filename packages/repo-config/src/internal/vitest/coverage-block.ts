import type { ViteUserConfig } from "vitest/config";
import type { CoverageThresholds } from "@/vitest/vitest.types";

type Coverage = NonNullable<NonNullable<ViteUserConfig["test"]>["coverage"]>;

/**
 * The v8 coverage block: every file under `coverageInclude`, barrels, types,
 * tests and fixtures left out, and per-file thresholds at 95 unless the package
 * names an axis — or reports only, with `thresholds: false`.
 */
export const coverageBlock = ({
  reporter,
  include,
  exclude,
  thresholds,
  reportsDirectory,
}: {
  readonly reporter: readonly string[];
  readonly include: readonly string[];
  readonly exclude: readonly string[];
  readonly thresholds: CoverageThresholds | false;
  readonly reportsDirectory: string | undefined;
}): Coverage => ({
  provider: "v8",
  reporter: [...reporter],
  include: [...include],
  exclude: [
    "src/**/*.test.{ts,tsx}",
    "src/**/*.fixtures.{ts,tsx}",
    "src/**/*.types.ts",
    "src/index.ts",
    ...exclude,
  ],
  ...(reportsDirectory === undefined ? {} : { reportsDirectory }),
  ...(thresholds === false
    ? {}
    : {
        thresholds: {
          perFile: true,
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95,
          ...thresholds,
        },
      }),
});

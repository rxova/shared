import { configDefaults, defineConfig, type ViteUserConfig } from "vitest/config";
// Relative on purpose, and only here: this package's own vitest.config.ts loads
// this file from source, before any `@/` alias exists.
// eslint-disable-next-line no-restricted-imports -- see above
import { browserProjects } from "../internal/vitest/browser-projects.ts";
// eslint-disable-next-line no-restricted-imports -- see above
import { coverageBlock } from "../internal/vitest/coverage-block.ts";
// eslint-disable-next-line no-restricted-imports -- see above
import { resolveAliases } from "../internal/vitest/resolve-aliases.ts";
import type { BaseVitestOptions } from "@/vitest/vitest.types";

/**
 * A package's Vitest config, from the shared preset. Every `vitest.config.ts`
 * is a one-liner over this, so raising the bar is a single-file change rather
 * than a sweep that misses a package.
 *
 * Coverage is per file, 95% on every axis by default, over every source file
 * under `src/` whether or not a test imports it. A package can set its own
 * `thresholds` (only the axes it names change, `false` reports without
 * enforcing), drop coverage with `coverage: false`, measure other files with
 * `coverageInclude`, and keep files out of discovery with `testExclude`.
 * Barrels, `.types.ts` files, tests and fixtures are left out: none has
 * executable lines worth a threshold, so logic that lands in one is logic
 * nobody measures.
 *
 * Imports resolve the way the repositories write them: `@/…` is the package's
 * own `src/`, the same alias the package's tsconfig `paths` declares; `alias`
 * adds more after it.
 *
 * With `browser`, the suite splits into a unit project and a browser project
 * (`vitest --project unit` never starts a browser).
 *
 * Every other option (`plugins`, `dedupe`, timeouts, `globals`, `setupFiles`,
 * `fileParallelism`, `silent`) is Vitest's own, set only when given.
 */
export const baseVitestConfig = ({
  root = process.cwd(),
  environment = "node",
  include = ["src/**/*.test.ts", "src/**/*.test.tsx"],
  testExclude = [],
  coverageInclude = ["src/**/*.{ts,tsx}"],
  exclude = [],
  thresholds = {},
  reporter = ["text", "lcov"],
  coverage = true,
  reportsDirectory,
  plugins,
  dedupe,
  alias,
  testTimeout,
  hookTimeout,
  globals,
  setupFiles,
  fileParallelism,
  silent,
  browser,
  unitName = "unit",
}: BaseVitestOptions = {}): ViteUserConfig =>
  defineConfig({
    ...(plugins === undefined ? {} : { plugins }),
    resolve: {
      alias: resolveAliases(root, alias),
      ...(dedupe === undefined ? {} : { dedupe: [...dedupe] }),
    },
    test: {
      ...(browser === undefined
        ? {
            environment,
            include: [...include],
            exclude: [...configDefaults.exclude, ...testExclude],
          }
        : { projects: browserProjects({ browser, unitName, environment, include, testExclude }) }),
      ...(testTimeout === undefined ? {} : { testTimeout }),
      ...(hookTimeout === undefined ? {} : { hookTimeout }),
      ...(globals === undefined ? {} : { globals }),
      ...(setupFiles === undefined ? {} : { setupFiles: [...setupFiles] }),
      ...(fileParallelism === undefined ? {} : { fileParallelism }),
      ...(silent === undefined ? {} : { silent }),
      ...(coverage
        ? {
            coverage: coverageBlock({
              reporter,
              include: coverageInclude,
              exclude,
              thresholds,
              reportsDirectory,
            }),
          }
        : {}),
    },
  });

import type { ViteUserConfig } from "vitest/config";

type TestConfig = NonNullable<ViteUserConfig["test"]>;
type BrowserConfig = NonNullable<TestConfig["browser"]>;

/** Per-file coverage thresholds in percent. */
export interface CoverageThresholds {
  readonly statements?: number;
  readonly branches?: number;
  readonly functions?: number;
  readonly lines?: number;
}

/** A second, browser-mode project beside the unit project. */
export interface BrowserProjectOptions {
  /** Test files that run in the browser. The unit project leaves them out. */
  readonly include: readonly string[];
  /** The browsers to run them in, e.g. `[{ browser: "chromium" }]`. */
  readonly instances: NonNullable<BrowserConfig["instances"]>;
  /**
   * The browser provider, e.g. `playwright()` from `@vitest/browser-playwright`. Passed in rather
   * than loaded here, so the provider stays the package's own dev dependency.
   */
  readonly provider: NonNullable<BrowserConfig["provider"]>;
  /** Defaults to `true`. */
  readonly headless?: boolean;
  /** The project name, for `vitest --project`. Defaults to `browser`. */
  readonly name?: string;
}

/** One alias entry, as Vite takes it. */
export interface AliasEntry {
  readonly find: string | RegExp;
  readonly replacement: string;
}

export interface BaseVitestOptions {
  /** The package directory; `@/` maps to its `src/`. Defaults to the working directory. */
  readonly root?: string;
  /** Vitest `environment`. `jsdom` or `happy-dom` must be installed in the package. */
  readonly environment?: "node" | "jsdom" | "happy-dom";
  /** Test discovery globs. Defaults to `src/**\/*.test.ts(x)`. */
  readonly include?: readonly string[];
  /** Globs kept out of test discovery, on top of Vitest's own (`node_modules`, …). */
  readonly testExclude?: readonly string[];
  /** The files coverage measures. Defaults to `src/**\/*.{ts,tsx}`. */
  readonly coverageInclude?: readonly string[];
  /** Extra coverage exclusions. Each one needs a reason at its call site. */
  readonly exclude?: readonly string[];
  /**
   * Per-file coverage thresholds in percent, each axis defaulting to 95. Set one only where the
   * package's suite genuinely holds a different bar, with the reason beside it. `false` reports
   * coverage without enforcing any threshold (apps, private tooling).
   */
  readonly thresholds?: CoverageThresholds | false;
  /** Coverage reporters. Defaults to `text` for the log and `lcov` for a coverage service. */
  readonly reporter?: readonly string[];
  /** `false` drops the coverage block entirely, for suites that only spawn processes. */
  readonly coverage?: boolean;
  /** Where coverage reports go. Vitest's default is `coverage`. */
  readonly reportsDirectory?: string;
  /** Vite plugins, e.g. `[react()]`. */
  readonly plugins?: ViteUserConfig["plugins"];
  /** Packages resolved to one copy, e.g. `["react", "react-dom"]`. */
  readonly dedupe?: readonly string[];
  /** More aliases, after `@/`: a `{ from: to }` record or Vite's `{ find, replacement }` list. */
  readonly alias?: Readonly<Record<string, string>> | readonly AliasEntry[];
  /** Per-test timeout in milliseconds. */
  readonly testTimeout?: number;
  /** Per-hook timeout in milliseconds. */
  readonly hookTimeout?: number;
  /** `describe`, `it`, `expect`, `vi` as globals. */
  readonly globals?: boolean;
  /** Files run before each test file. */
  readonly setupFiles?: readonly string[];
  /** `false` runs test files one at a time (suites sharing a server or port). */
  readonly fileParallelism?: boolean;
  /** Silences the tests' console output. */
  readonly silent?: boolean;
  /** Splits the suite into a unit project and a browser project. */
  readonly browser?: BrowserProjectOptions;
  /** The unit project's name when `browser` is set. Defaults to `unit`. */
  readonly unitName?: string;
}

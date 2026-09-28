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
   * package's suite genuinely holds a different bar, with the reason beside it.
   */
  readonly thresholds?: {
    readonly statements?: number;
    readonly branches?: number;
    readonly functions?: number;
    readonly lines?: number;
  };
  /** Coverage reporters. Defaults to `text` for the log and `lcov` for a coverage service. */
  readonly reporter?: readonly string[];
}

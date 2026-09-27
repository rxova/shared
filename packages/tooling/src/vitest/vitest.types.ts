export interface BaseVitestOptions {
  /** The package directory; `@/` maps to its `src/`. Defaults to the working directory. */
  readonly root?: string;
  /** Vitest `environment`. `jsdom` or `happy-dom` must be installed in the package. */
  readonly environment?: 'node' | 'jsdom' | 'happy-dom';
  /** Test discovery globs. Defaults to `src/**\/*.test.ts(x)`. */
  readonly include?: readonly string[];
  /** Extra coverage exclusions. Each one needs a reason at its call site. */
  readonly exclude?: readonly string[];
  /** Coverage reporters. Defaults to `text` for the log and `lcov` for a coverage service. */
  readonly reporter?: readonly string[];
}

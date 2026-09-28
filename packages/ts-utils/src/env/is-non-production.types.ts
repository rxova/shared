/** The part of a bundler's `import.meta.env` (Vite and friends) `isNonProduction` reads. */
export interface BundlerEnv {
  readonly DEV?: unknown;
  readonly PROD?: unknown;
}

export interface NonProductionOptions {
  /**
   * The caller's `import.meta.env`. Passed in rather than read here, because
   * `import.meta` is a syntax error in a CommonJS build: the call site is where
   * the bundler that understands it can substitute it.
   */
  readonly bundlerEnv?: BundlerEnv | null | undefined;
  /**
   * An explicit `NODE_ENV`. The key being present, even as `undefined`, stops
   * `isNonProduction` reading `process.env.NODE_ENV` itself.
   */
  readonly nodeEnv?: string | undefined;
}

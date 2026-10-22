export interface RandomBelowOptions {
  /**
   * Called once per process (per callback) when `crypto.getRandomValues` is
   * missing and the draw comes from `Math.random` instead. The same contract
   * `randomHex` has, and the same callback counts as notified for both.
   */
  readonly onFallback?: () => void;
}

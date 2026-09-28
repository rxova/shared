export interface RandomHexOptions {
  /**
   * Called once per process (per callback) when `crypto.getRandomValues` is
   * missing and the bytes come from `Math.random` instead. The caller decides
   * what that means: a warning with its own code, a thrown error, nothing.
   */
  readonly onFallback?: () => void;
}

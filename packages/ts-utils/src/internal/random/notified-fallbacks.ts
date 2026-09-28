/**
 * The `onFallback` callbacks `randomHex` has already called. Weak, so a
 * callback created per call is not kept alive by having been notified once.
 */
export const notifiedFallbacks = new WeakSet<() => void>();

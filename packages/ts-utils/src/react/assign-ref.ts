import type { Ref } from "react";

/**
 * Hands `value` to a ref of either kind: a callback ref is called, an object
 * ref gets `.current`, and `null`/`undefined` is skipped. Returns what a React
 * 19 callback ref may return — its cleanup — so a caller that merges refs can
 * run it instead of calling the ref again with `null`.
 */
export const assignRef = <T>(
  ref: Ref<T> | undefined,
  value: T | null,
): (() => void) | undefined => {
  if (typeof ref === "function") {
    const cleanup: unknown = ref(value);
    return typeof cleanup === "function" ? (cleanup as () => void) : undefined;
  }
  if (ref !== null && ref !== undefined) (ref as { current: T | null }).current = value;
  return undefined;
};

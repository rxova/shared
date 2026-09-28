import { useMemo, type Ref, type RefCallback } from "react";
import { assignRef } from "@/react/assign-ref";

/**
 * One callback ref that hands the node to every ref given, of either kind —
 * the usual case being a component's own ref plus the one forwarded to it.
 *
 * Stable while the refs are: it changes identity only when one of them does,
 * so React detaches the old set and attaches the new one exactly then. It
 * returns no cleanup, so React 18 and 19 both detach it by calling it with
 * `null`; a React 19 callback ref that returned a cleanup on attach gets that
 * cleanup run instead of a second call with `null`.
 */
export const useMergedRefs = <T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> =>
  useMemo(() => {
    let cleanups: ((() => void) | undefined)[] = [];
    return (value: T | null) => {
      if (value !== null) {
        cleanups = refs.map((ref) => assignRef(ref, value));
        return;
      }
      refs.forEach((ref, index) => {
        const cleanup = cleanups[index];
        if (cleanup === undefined) assignRef(ref, null);
        else cleanup();
      });
      cleanups = [];
    };
    // The refs themselves are the dependencies, spread so their count may vary.
  }, refs);

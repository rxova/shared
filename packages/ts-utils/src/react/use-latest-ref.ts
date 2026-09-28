import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/react/use-isomorphic-layout-effect";

/**
 * A ref that always holds the value from the latest committed render, for a
 * callback that must not re-subscribe whenever its handler changes identity
 * (a message listener, an interval, a stable event handler).
 *
 * The ref is written in a layout effect, never during render: writing during
 * render leaks the value of a render React later throws away (concurrent
 * rendering, Strict Mode). So read it from effects and event handlers, not
 * while rendering.
 */
export const useLatestRef = <T>(value: T): { readonly current: T } => {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
};

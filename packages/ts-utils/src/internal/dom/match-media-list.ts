import { canUseDOM } from "@/dom/can-use-dom";

/**
 * The `MediaQueryList` for `query`, or `undefined` where there is no DOM or no
 * `matchMedia` (jsdom leaves it out, and its types claim it is always there).
 */
export const matchMediaList = (query: string): MediaQueryList | undefined => {
  if (!canUseDOM()) return undefined;
  const { matchMedia } = window as { matchMedia?: Window["matchMedia"] };
  return typeof matchMedia === "function" ? matchMedia.call(window, query) : undefined;
};

import { matchMediaList } from "@/internal/dom/match-media-list";

/**
 * Whether the user asked the system for less motion, read once, now. False on
 * the server and where `matchMedia` is missing (jsdom leaves it out), so the
 * default is the animated path a page was designed with.
 *
 * For a value that follows the setting while a component is mounted, use
 * `useMediaQuery('(prefers-reduced-motion: reduce)')` from `@rxova/ts-utils/react`.
 */
export const prefersReducedMotion = (): boolean =>
  matchMediaList("(prefers-reduced-motion: reduce)")?.matches ?? false;

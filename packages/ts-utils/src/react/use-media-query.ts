import { useCallback, useSyncExternalStore } from 'react';
import { matchMediaList } from '@/internal/dom/match-media-list';

/**
 * Whether `query` matches, kept current while the component is mounted —
 * `useSyncExternalStore` over `matchMedia`, so a change re-renders without a
 * tearing frame.
 *
 * `serverValue` is what the server renders and what hydration starts from, so
 * choose the value the markup was designed for (usually `false`: no
 * preference). It is also the answer where `matchMedia` is missing, as in
 * jsdom, rather than a crash.
 */
export const useMediaQuery = (query: string, serverValue = false): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = matchMediaList(query);
      if (list === undefined) return () => undefined;
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => matchMediaList(query)?.matches ?? serverValue,
    () => serverValue,
  );
};

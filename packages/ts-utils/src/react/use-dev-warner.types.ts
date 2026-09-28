import type { DevWarnerOptions } from '@/dev-warner/create-dev-warner.types';

export interface UseDevWarnerOptions<Detail = unknown> extends Pick<
  DevWarnerOptions,
  'prefix' | 'docsUrl' | 'enabled'
> {
  /**
   * Receives each warning instead of the console, as the `detail` passed to
   * `warn`/`warnOnce` (so pass a `Detail` there) and nothing else, so a
   * component's own `onWarn` prop can be handed straight in. Read from the
   * latest render, so an inline arrow is fine.
   */
  readonly onWarn?: ((detail: Detail) => void) | undefined;
}

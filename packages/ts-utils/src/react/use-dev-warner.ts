import { useState } from 'react';
import { createDevWarner } from '@/dev-warner/create-dev-warner';
import type { DevWarner } from '@/dev-warner/create-dev-warner.types';
import { isDevelopment } from '@/env/is-development';
import type { UseDevWarnerOptions } from '@/react/use-dev-warner.types';
import { useLatestRef } from '@/react/use-latest-ref';

/**
 * `createDevWarner` for one component instance: `warnOnce` dedupes per
 * instance, so a re-rendering parent warns once per mounted input rather than
 * once per keystroke, and two inputs with the same problem each say so once.
 *
 * The `detail` passed to `warn`/`warnOnce` is for `onWarn`, which, when given,
 * replaces the console — the usual `onWarn(warning)` prop a component exposes
 * so an app can route its warnings, called with exactly that one argument.
 * Without it the console gets the formatted line alone. `onWarn` and `enabled`
 * are read from the latest render; `prefix` and `docsUrl` from the first.
 *
 * Keep the production guard at the call site —
 * `if (process.env.NODE_ENV !== 'production') warner.warnOnce(…)` — so the
 * bundler drops the message text from production builds.
 */
export const useDevWarner = <Detail = unknown>({
  prefix,
  docsUrl,
  enabled,
  onWarn,
}: UseDevWarnerOptions<Detail>): DevWarner => {
  const latest = useLatestRef({ enabled, onWarn });
  const [warner] = useState(() =>
    createDevWarner({
      prefix,
      ...(docsUrl === undefined ? {} : { docsUrl }),
      enabled: () => (latest.current.enabled ?? isDevelopment)(),
      // createDevWarner calls a sink with `(line)` or `('%s', line, detail)`.
      sink: (...args) => {
        const handler = latest.current.onWarn;
        const line = String(args.length === 3 ? args[1] : args[0]);
        if (handler !== undefined) {
          handler(args[2] as Detail);
          return;
        }
        // The whole point of this hook; guarded above by `enabled`.
        // eslint-disable-next-line no-console
        console.warn(line);
      },
    }),
  );
  return warner;
};

import { describePackages } from '@/internal/publish/describe-packages';
import type { PublishedPackage } from '@/internal/publish/published-package.types';

/**
 * Blocks until the registry serves every published version. npm can take
 * minutes to list a version after `npm publish` returns, so this polls with a
 * backoff (5 s doubling to 30 s) and fails only once `deadlineMs` (10 minutes)
 * says it never caught up.
 */
export const waitForRegistry = (
  packages: readonly PublishedPackage[],
  {
    isPublished,
    sleep,
    now,
    deadlineMs = 10 * 60_000,
    log = console.log,
  }: {
    isPublished: (item: PublishedPackage) => boolean;
    sleep: (milliseconds: number) => void;
    now: () => number;
    deadlineMs?: number;
    log?: (message: string) => void;
  },
): void => {
  const start = now();
  let pending = [...packages];
  let delay = 5_000;
  for (;;) {
    pending = pending.filter((item) => !isPublished(item));
    if (pending.length === 0) return;
    const elapsed = now() - start;
    if (elapsed >= deadlineMs) {
      throw new Error(
        `npm still does not serve ${describePackages(pending)} after ${String(deadlineMs / 1000)}s`,
      );
    }
    const wait = Math.min(delay, deadlineMs - elapsed);
    log(
      `post-publish-smoke: waiting ${String(wait / 1000)}s for npm to serve ${describePackages(pending)}`,
    );
    sleep(wait);
    delay = Math.min(delay * 2, 30_000);
  }
};

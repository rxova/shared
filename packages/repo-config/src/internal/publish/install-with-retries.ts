import { npmFailureReason } from "@/internal/publish/npm-failure-reason";

/**
 * Runs `install`, retrying after 10 s: the registry can list a version a
 * moment before a fresh install resolves it. Every failure prints npm's own
 * error, so a real defect (a bad range, a missing file) is not mistaken for lag.
 */
export const installWithRetries = (
  install: () => void,
  {
    attempts = 3,
    sleep,
    log = console.log,
  }: { attempts?: number; sleep: (milliseconds: number) => void; log?: (message: string) => void },
): void => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      install();
      return;
    } catch (failure) {
      const reason = npmFailureReason(failure);
      if (attempt >= attempts) {
        throw new Error(`the published packages did not install from npm:\n${reason}`, {
          cause: failure,
        });
      }
      log(`post-publish-smoke: install attempt ${String(attempt)} failed; retrying\n${reason}`);
      sleep(10_000);
    }
  }
};

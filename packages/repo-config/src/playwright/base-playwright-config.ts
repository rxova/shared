import { devices, type PlaywrightTestConfig } from "@playwright/test";
import { browserDevice } from "@/internal/playwright/browser-device";
import type { BasePlaywrightOptions } from "@/playwright/playwright.types";

/**
 * A Playwright config from the few things that differ per app: the server
 * command and where it listens. Every spec runs in each of `browsers` as the
 * matching desktop device; CI gets retries, `forbidOnly`, the GitHub reporter
 * and a fresh server, a local run reuses the one already up.
 */
export const basePlaywrightConfig = ({
  command,
  port,
  url,
  testDir = "e2e",
  browsers = ["chromium"],
  testIgnore,
  projects = [],
  ci = Boolean(process.env.CI),
  retries = ci ? 2 : 0,
  workers = 1,
  fullyParallel = false,
  timeout,
  webServerTimeout = 120_000,
  reuseExistingServer = !ci,
  trace = "retain-on-failure",
  screenshot = "only-on-failure",
  reporter = ci ? [["github"], ["list"]] : [["list"]],
  snapshotPathTemplate,
  forbidOnly = ci,
  stdout = "pipe",
}: BasePlaywrightOptions): PlaywrightTestConfig => {
  if (url === undefined && port === undefined) {
    throw new TypeError("basePlaywrightConfig: pass `port` or `url`.");
  }
  const baseURL = url ?? `http://localhost:${String(port)}`;
  return {
    testDir,
    fullyParallel,
    forbidOnly,
    retries,
    workers,
    reporter,
    ...(timeout === undefined ? {} : { timeout }),
    ...(snapshotPathTemplate === undefined ? {} : { snapshotPathTemplate }),
    use: { baseURL, trace, screenshot },
    projects: [
      ...browsers.map((browser) => ({
        name: browser,
        use: { ...devices[browserDevice(browser)] },
        ...(testIgnore === undefined ? {} : { testIgnore }),
      })),
      ...projects,
    ],
    ...(command === undefined
      ? {}
      : {
          webServer: {
            command,
            url: baseURL,
            reuseExistingServer,
            timeout: webServerTimeout,
            stdout,
          },
        }),
  };
};

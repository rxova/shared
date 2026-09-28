import type { PlaywrightTestConfig } from "@playwright/test";

type Use = NonNullable<PlaywrightTestConfig["use"]>;
type WebServer = Extract<NonNullable<PlaywrightTestConfig["webServer"]>, { command: string }>;

/** A browser the preset runs every spec in, as the matching desktop device. */
export type PlaywrightBrowser = "chromium" | "firefox" | "webkit";

export interface BasePlaywrightOptions {
  /** Starts the server the specs run against. Without it, the specs hit `url` as it is. */
  readonly command?: string;
  /** The server's port on localhost; `baseURL` is `http://localhost:<port>`. */
  readonly port?: number;
  /** The full `baseURL`, when the host is not localhost. Wins over `port`. */
  readonly url?: string;
  /** Defaults to `e2e`. */
  readonly testDir?: string;
  /** Defaults to `["chromium"]`. */
  readonly browsers?: readonly PlaywrightBrowser[];
  /** Specs every browser project skips, e.g. `/visual\.spec/` when a visual project runs them. */
  readonly testIgnore?: PlaywrightTestConfig["testIgnore"];
  /** Projects appended after the browser projects, e.g. a local-only visual check. */
  readonly projects?: NonNullable<PlaywrightTestConfig["projects"]>;
  /** Whether this is a CI run. Defaults to `Boolean(process.env.CI)`. */
  readonly ci?: boolean;
  /** Defaults to 2 on CI, 0 locally. */
  readonly retries?: number;
  /** Defaults to 1: one server, one worker, no port or state races. */
  readonly workers?: number | string;
  /** Defaults to `false`. */
  readonly fullyParallel?: boolean;
  /** Per-test timeout in milliseconds. Playwright's default when unset. */
  readonly timeout?: number;
  /** How long the server may take to answer. Defaults to 120 s. */
  readonly webServerTimeout?: number;
  /** Defaults to `true` locally and `false` on CI. */
  readonly reuseExistingServer?: boolean;
  /** Defaults to `retain-on-failure`. */
  readonly trace?: Use["trace"];
  /** Defaults to `only-on-failure`. */
  readonly screenshot?: Use["screenshot"];
  /** Defaults to `github` plus `list` on CI, `list` locally. */
  readonly reporter?: PlaywrightTestConfig["reporter"];
  readonly snapshotPathTemplate?: string;
  /** Defaults to `true` on CI. */
  readonly forbidOnly?: boolean;
  /** The server's stdout. Defaults to `pipe`. */
  readonly stdout?: WebServer["stdout"];
}

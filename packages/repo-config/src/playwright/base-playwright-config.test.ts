import { devices } from "@playwright/test";
import { describe, expect, it } from "vitest";
import { basePlaywrightConfig } from "@/playwright/base-playwright-config";

describe("basePlaywrightConfig", () => {
  it("runs e2e/ in chromium against a local server, one worker, locally", () => {
    expect(basePlaywrightConfig({ command: "pnpm preview", port: 4175, ci: false })).toEqual({
      testDir: "e2e",
      fullyParallel: false,
      forbidOnly: false,
      retries: 0,
      workers: 1,
      reporter: [["list"]],
      use: {
        baseURL: "http://localhost:4175",
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
      },
      projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
      webServer: {
        command: "pnpm preview",
        url: "http://localhost:4175",
        reuseExistingServer: true,
        timeout: 120_000,
        stdout: "pipe",
      },
    });
  });

  it("retries, forbids .only, reports to GitHub and starts a fresh server on CI", () => {
    const config = basePlaywrightConfig({ command: "pnpm preview", port: 4175, ci: true });
    expect(config).toMatchObject({
      forbidOnly: true,
      retries: 2,
      reporter: [["github"], ["list"]],
      webServer: { reuseExistingServer: false },
    });
  });

  it("reads CI from the environment by default", () => {
    const before = process.env.CI;
    try {
      process.env.CI = "true";
      expect(basePlaywrightConfig({ port: 1 }).retries).toBe(2);
      delete process.env.CI;
      expect(basePlaywrightConfig({ port: 1 }).retries).toBe(0);
    } finally {
      if (before === undefined) delete process.env.CI;
      else process.env.CI = before;
    }
  });

  it("runs every browser as its desktop device, then the extra projects", () => {
    const visual = { name: "visual", testMatch: /visual\.spec/ };
    const config = basePlaywrightConfig({
      port: 1,
      ci: false,
      browsers: ["chromium", "firefox", "webkit"],
      testIgnore: /visual\.spec/,
      projects: [visual],
    });
    expect(config.projects).toEqual([
      { name: "chromium", use: { ...devices["Desktop Chrome"] }, testIgnore: /visual\.spec/ },
      { name: "firefox", use: { ...devices["Desktop Firefox"] }, testIgnore: /visual\.spec/ },
      { name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /visual\.spec/ },
      visual,
    ]);
  });

  it("takes a full url, and runs without a server when there is no command", () => {
    const config = basePlaywrightConfig({ url: "http://127.0.0.2:5179", port: 1, ci: false });
    expect(config.use?.baseURL).toBe("http://127.0.0.2:5179");
    expect(config).not.toHaveProperty("webServer");
  });

  it("passes the remaining knobs through", () => {
    const config = basePlaywrightConfig({
      command: "serve",
      port: 1,
      ci: false,
      testDir: "tests",
      retries: 1,
      workers: "50%",
      fullyParallel: true,
      timeout: 30_000,
      webServerTimeout: 600_000,
      reuseExistingServer: false,
      trace: "on-first-retry",
      screenshot: "off",
      reporter: "dot",
      snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
      forbidOnly: true,
      stdout: "ignore",
    });
    expect(config).toMatchObject({
      testDir: "tests",
      retries: 1,
      workers: "50%",
      fullyParallel: true,
      timeout: 30_000,
      reporter: "dot",
      snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
      forbidOnly: true,
      use: { trace: "on-first-retry", screenshot: "off" },
      webServer: { timeout: 600_000, reuseExistingServer: false, stdout: "ignore" },
    });
  });

  it("needs a port or a url", () => {
    expect(() => basePlaywrightConfig({ command: "serve" })).toThrow(/port.*url/);
  });
});

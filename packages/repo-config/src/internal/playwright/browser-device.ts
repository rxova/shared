import type { PlaywrightBrowser } from "@/playwright/playwright.types";

/** The desktop device descriptor Playwright names for each browser. */
export const browserDevice = (browser: PlaywrightBrowser): string =>
  ({ chromium: "Desktop Chrome", firefox: "Desktop Firefox", webkit: "Desktop Safari" })[browser];

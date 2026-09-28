import { devices } from "@playwright/test";
import { describe, expect, it } from "vitest";
import { browserDevice } from "@/internal/playwright/browser-device";

describe("browserDevice", () => {
  it("names a real desktop device for each browser", () => {
    for (const browser of ["chromium", "firefox", "webkit"] as const) {
      expect(devices[browserDevice(browser)]?.defaultBrowserType).toBe(browser);
    }
  });
});

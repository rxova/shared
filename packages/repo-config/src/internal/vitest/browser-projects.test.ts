import { configDefaults } from "vitest/config";
import { describe, expect, it } from "vitest";
import { browserProjects } from "@/internal/vitest/browser-projects";
import type { BrowserProjectOptions } from "@/vitest/vitest.types";

const provider = { name: "fake" } as unknown as BrowserProjectOptions["provider"];

const options = {
  browser: {
    include: ["src/**/*.browser.test.tsx"],
    instances: [{ browser: "chromium" as const }],
    provider,
  },
  unitName: "unit",
  environment: "node",
  include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  testExclude: ["src/legacy/**"],
};

describe("browserProjects", () => {
  it("keeps the browser files out of the unit project", () => {
    const [unit] = browserProjects(options);
    expect(unit).toEqual({
      extends: true,
      test: {
        name: "unit",
        environment: "node",
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        exclude: [...configDefaults.exclude, "src/legacy/**", "src/**/*.browser.test.tsx"],
      },
    });
  });

  it("runs only the browser files in the browser, headless by default", () => {
    const [, browser] = browserProjects(options);
    expect(browser).toEqual({
      extends: true,
      test: {
        name: "browser",
        include: ["src/**/*.browser.test.tsx"],
        exclude: [...configDefaults.exclude, "src/legacy/**"],
        browser: {
          enabled: true,
          provider,
          headless: true,
          instances: [{ browser: "chromium" }],
        },
      },
    });
  });

  it("takes the project names and headless from the package", () => {
    const [unit, browser] = browserProjects({
      ...options,
      unitName: "logic",
      browser: { ...options.browser, name: "dom", headless: false },
    });
    expect(unit).toMatchObject({ test: { name: "logic" } });
    expect(browser).toMatchObject({ test: { name: "dom", browser: { headless: false } } });
  });
});

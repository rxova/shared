import { describe, expect, it } from "vitest";
import { isShippedPath } from "@/internal/changeset/is-shipped-path";

const files = ["dist", "./assets/logo.svg", "llms.txt"];

describe("isShippedPath", () => {
  it.each([
    "package.json",
    "README.md",
    "readme",
    "LICENSE",
    "LICENCE.txt",
    "llms.txt",
    "assets/logo.svg",
    "src/index.ts",
    "src/lib/format.ts",
    "tsdown.config.ts",
  ])("ships %s", (path) => {
    expect(isShippedPath(path, files)).toBe(true);
  });

  it.each([
    "CHANGELOG.md",
    "assets/banner.png",
    "demo/Demo.tsx",
    "e2e/input.spec.ts",
    "src/__tests__/format.test.ts",
    "src/format.test.ts",
    "vitest.config.ts",
    "tsconfig.json",
    "docs/README.md",
  ])("does not ship %s", (path) => {
    expect(isShippedPath(path, files)).toBe(false);
  });

  it("ships only the always-packed files when `files` is missing", () => {
    expect(isShippedPath("src/index.ts")).toBe(false);
    expect(isShippedPath("README.md")).toBe(true);
  });

  it("matches a directory entry written with a trailing slash", () => {
    expect(isShippedPath("templates/a.md", ["templates/"])).toBe(true);
  });

  it("refuses a glob rather than guessing at it", () => {
    expect(() => isShippedPath("lib/a.js", ["lib/*.js"])).toThrow(/glob/);
  });
});

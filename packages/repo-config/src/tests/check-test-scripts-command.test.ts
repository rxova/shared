import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { checkTestScriptsCommand } from "@/tests/check-test-scripts-command";

const made: string[] = [];
const repo = (files: Record<string, string>) => {
  const root = mkdtempSync(join(tmpdir(), "check-test-scripts-"));
  made.push(root);
  for (const [path, contents] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), contents);
  }
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

const withTest = JSON.stringify({ scripts: { test: "vitest run" } });
const without = JSON.stringify({ scripts: { build: "tsdown" } });

describe("checkTestScriptsCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it("passes when every suite has a test script", () => {
    const root = repo({
      "packages/a/vitest.config.ts": "",
      "packages/a/package.json": withTest,
      "packages/b/package.json": without,
      "apps/docs/vitest.config.mjs": "",
      "apps/docs/package.json": withTest,
    });
    expect(checkTestScriptsCommand({ root })).toBe(0);
    expect(log).toHaveBeenCalledWith(
      "check-test-scripts: 2 test suite(s), each with a test script",
    );
  });

  it("fails a suite without one, or without a manifest", () => {
    const root = repo({
      "packages/a/vitest.config.ts": "",
      "packages/a/package.json": without,
      "packages/b/vitest.config.js": "",
    });
    expect(checkTestScriptsCommand({ root })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("  packages/a\n  packages/b"));
  });

  it("reads the globs from the config, and the working directory by default", () => {
    const root = repo({
      "package.json": JSON.stringify({ repoConfig: { testScripts: { globs: ["tools/*"] } } }),
      "packages/a/vitest.config.ts": "",
      "tools/x/vitest.config.ts": "",
      "tools/x/package.json": withTest,
    });
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(checkTestScriptsCommand()).toBe(0);
    cwd.mockRestore();
    const bad = repo({
      "package.json": JSON.stringify({ repoConfig: { testScripts: { globs: 1 } } }),
    });
    expect(checkTestScriptsCommand({ root: bad })).toBe(1);
  });
});

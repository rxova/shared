import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { coverageSummaryCommand } from "@/coverage-summary/coverage-summary-command";

const root = mkdtempSync(join(tmpdir(), "coverage-summary-"));
const metric = { pct: 100 };
mkdirSync(join(root, "coverage"));
writeFileSync(
  join(root, "coverage", "coverage-summary.json"),
  JSON.stringify({
    total: { lines: metric, branches: metric, functions: metric, statements: metric },
  }),
);
writeFileSync(join(root, "bad.json"), "{}");

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("coverageSummaryCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => undefined);
  const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
  const out = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  afterEach(() => {
    log.mockClear();
    error.mockClear();
    out.mockClear();
  });

  it("prints the block without a step summary", () => {
    expect(coverageSummaryCommand(undefined, { root, env: {} })).toBe(0);
    expect(out).toHaveBeenCalledWith(expect.stringContaining("- Lines: 100.00%"));
  });

  it("appends the block to the step summary on GitHub Actions", () => {
    const summary = join(root, "summary.md");
    expect(coverageSummaryCommand(undefined, { root, env: { GITHUB_STEP_SUMMARY: summary } })).toBe(
      0,
    );
    expect(readFileSync(summary, "utf8")).toContain("## Coverage");
    expect(out).not.toHaveBeenCalled();
  });

  it("passes when there is no report, and fails on a report without totals", () => {
    expect(coverageSummaryCommand("missing.json", { root })).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("nothing to summarise"));
    expect(coverageSummaryCommand("bad.json", { root })).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining('has no "total" block'));
  });

  it("reads the working directory by default", () => {
    vi.stubEnv("GITHUB_STEP_SUMMARY", "");
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(root);
    expect(coverageSummaryCommand()).toBe(0);
    cwd.mockRestore();
    vi.unstubAllEnvs();
  });
});

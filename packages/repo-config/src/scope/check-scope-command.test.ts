import { fakeGit } from "@/internal/scope/fake-git.fixtures";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkScopeCommand } from "@/scope/check-scope-command";

const RANGE = { BASE_SHA: "aaa", HEAD_SHA: "bbb" };
const noConfig = () => undefined;

describe("checkScopeCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  it("reports the verdict and exits 0", () => {
    expect(checkScopeCommand({}, { run: fakeGit([]), read: noConfig })).toBe(0);
    expect(log).toHaveBeenCalledWith("check-scope: code-changed=true");
    expect(log).toHaveBeenCalledWith("check-scope: docs-only=false");
    expect(log).toHaveBeenCalledWith("check-scope: docs-changed=true");
  });

  it("writes the step outputs when the workflow provides a file for them", () => {
    const dir = mkdtempSync(join(tmpdir(), "check-scope-"));
    const output = join(dir, "output");
    try {
      const env = { ...RANGE, GITHUB_OUTPUT: output };
      checkScopeCommand(env, { run: fakeGit(["README.md"]), read: noConfig });
      expect(readFileSync(output, "utf8")).toBe(
        "code-changed=false\ndocs-only=true\ndocs-changed=false\n",
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("applies repoConfig.scope from the root package.json", () => {
    const read = () => JSON.stringify({ repoConfig: { scope: { ignore: ["notes/**"] } } });
    checkScopeCommand(RANGE, { run: fakeGit(["README.md"]), read, root: "/repo" });
    expect(log).toHaveBeenCalledWith("check-scope: code-changed=true");
  });

  it("reports an invalid repoConfig.scope and runs everything", () => {
    const read = () => JSON.stringify({ repoConfig: { scope: { ignore: "README.md" } } });
    expect(checkScopeCommand(RANGE, { run: fakeGit(["README.md"]), read })).toBe(0);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("repoConfig.scope.ignore"));
    expect(log).toHaveBeenCalledWith("check-scope: code-changed=true");
  });

  it("reads the environment, the repository and the real git by default", () => {
    const empty = mkdtempSync(join(tmpdir(), "check-scope-root-"));
    const cwd = vi.spyOn(process, "cwd").mockReturnValue(empty);
    vi.stubEnv("BASE_SHA", "");
    vi.stubEnv("GITHUB_OUTPUT", "");
    try {
      expect(checkScopeCommand()).toBe(0);
      expect(log).toHaveBeenCalledWith("check-scope: no usable commit range");
    } finally {
      vi.unstubAllEnvs();
      cwd.mockRestore();
      rmSync(empty, { recursive: true, force: true });
    }
  });
});

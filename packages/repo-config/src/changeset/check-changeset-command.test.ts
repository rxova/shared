import { SKIP_LABEL } from "@/internal/changeset/skip-label";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkChangesetCommand } from "@/changeset/check-changeset-command";

const PUBLISHED = ["example"];

describe("checkChangesetCommand", () => {
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  afterEach(() => {
    log.mockClear();
    error.mockClear();
  });

  const range = { BASE_SHA: "aaa", HEAD_SHA: "bbb" };
  const deps = (changed: string[], files: Record<string, string> = {}) => ({
    root: "/repo",
    published: PUBLISHED,
    diff: vi.fn(() => changed),
    read: (file: string) => files[file],
  });

  it("refuses to guess when the range is missing", () => {
    expect(checkChangesetCommand({})).toBe(1);
    expect(checkChangesetCommand({ BASE_SHA: "a" })).toBe(1);
    expect(checkChangesetCommand({ HEAD_SHA: "b" })).toBe(1);
    expect(error).toHaveBeenCalledWith("check-changeset: BASE_SHA and HEAD_SHA must be set");
  });

  it("asks for the diff of exactly the range it was given, with and without deletions", () => {
    const options = deps(["packages/repo-config/src/cli.ts"]);
    expect(checkChangesetCommand(range, options)).toBe(0);
    expect(options.diff).toHaveBeenCalledWith("aaa", "bbb");
    expect(options.diff).toHaveBeenCalledWith("aaa", "bbb", { existing: true });
    expect(log).toHaveBeenCalledWith(expect.stringContaining("no publishable change"));
  });

  it("reports a missing changeset on stderr and exits 1", () => {
    expect(checkChangesetCommand(range, deps(["packages/example/src/index.ts"]))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("adds no changeset"));
  });

  it("reads the label and the title from the environment the workflow sets", () => {
    const options = deps(["packages/example/package.json"]);
    expect(checkChangesetCommand({ ...range, PR_LABELS: `x,${SKIP_LABEL}` }, options)).toBe(0);
    expect(checkChangesetCommand({ ...range, PR_TITLE: `[${SKIP_LABEL}] bump` }, options)).toBe(0);
  });

  it("reads the published packages of the working directory when none are given", () => {
    const cwd = vi.spyOn(process, "cwd").mockReturnValue("/no/such/repo");
    const options = { diff: () => ["packages/example/src/index.ts"], read: () => undefined };
    expect(checkChangesetCommand(range, options)).toBe(0);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("no publishable change"));
    cwd.mockRestore();
  });

  describe("with singlePackage set", () => {
    const manifest = JSON.stringify({ repoConfig: { changeset: { singlePackage: true } } });
    const changed = ["packages/example/src/index.ts", ".changeset/a.md"];

    it("passes a changeset that names one package", () => {
      const files = {
        [join("/repo", "package.json")]: manifest,
        [join("/repo", ".changeset", "a.md")]: "---\n'@rxova/example': patch\n---\n\nFix.\n",
      };
      expect(checkChangesetCommand(range, deps(changed, files))).toBe(0);
    });

    it("fails a changeset that names two, and says which", () => {
      const files = {
        [join("/repo", "package.json")]: manifest,
        [join("/repo", ".changeset", "a.md")]: '---\n"a": patch\n"b": minor\n---\n',
      };
      expect(checkChangesetCommand(range, deps(changed, files))).toBe(1);
      expect(error).toHaveBeenCalledWith(expect.stringContaining("names 2 packages, expected 1"));
    });
  });

  it("reports a malformed config instead of throwing", () => {
    const files = { [join("/repo", "package.json")]: '{"repoConfig":{"changeset":1}}' };
    expect(checkChangesetCommand(range, deps([], files))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("repoConfig.changeset must be"));
  });
});

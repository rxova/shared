import { SKIP_LABEL } from "@/internal/changeset/skip-label";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
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

  describe("in a repository whose packages are all private", () => {
    const repo = (changeset: object) => {
      const root = mkdtempSync(join(tmpdir(), "check-changeset-private-"));
      mkdirSync(join(root, "packages", "app"), { recursive: true });
      writeFileSync(join(root, "package.json"), JSON.stringify({ repoConfig: { changeset } }));
      writeFileSync(join(root, "packages", "app", "package.json"), '{"private":true}');
      return root;
    };
    const diff = () => ["packages/app/src/index.ts"];

    it("requires nothing by default", () => {
      const root = repo({});
      try {
        expect(checkChangesetCommand(range, { root, diff })).toBe(0);
        expect(log).toHaveBeenCalledWith(expect.stringContaining("no publishable change"));
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });

    it("requires a changeset with includePrivate, unless the PR is labelled to skip", () => {
      const root = repo({ includePrivate: true });
      try {
        expect(checkChangesetCommand(range, { root, diff })).toBe(1);
        expect(error).toHaveBeenCalledWith(expect.stringContaining("adds no changeset"));
        expect(checkChangesetCommand({ ...range, PR_LABELS: SKIP_LABEL }, { root, diff })).toBe(0);
        const withChangeset = () => [...diff(), ".changeset/a.md"];
        expect(
          checkChangesetCommand(range, {
            root,
            diff: withChangeset,
            read: (file: string) =>
              file.endsWith("a.md")
                ? '---\n"app": patch\n---\n\nFix it.\n'
                : file.endsWith("package.json")
                  ? JSON.stringify({ repoConfig: { changeset: { includePrivate: true } } })
                  : undefined,
          }),
        ).toBe(0);
      } finally {
        rmSync(root, { recursive: true, force: true });
      }
    });
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

  it("fails a changeset whose summary the changelog would read as metadata, in any mode", () => {
    const files = {
      [join("/repo", ".changeset", "a.md")]: '---\n"example": patch\n---\n\ncommit: ({ a })\n',
    };
    const changed = ["packages/example/src/index.ts", ".changeset/a.md"];
    expect(checkChangesetCommand(range, deps(changed, files))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("reads as metadata"));
  });

  describe("with the shipped scope", () => {
    const files = {
      [join("/repo", "package.json")]: JSON.stringify({
        repoConfig: { changeset: { scope: "shipped" } },
      }),
      [join("/repo", "packages", "example", "package.json")]: JSON.stringify({
        name: "example",
        files: ["dist", "llms.txt"],
      }),
    };

    it("asks for a changeset when only the README or llms.txt changed, and names the files", () => {
      expect(checkChangesetCommand(range, deps(["packages/example/llms.txt"], files))).toBe(1);
      expect(error).toHaveBeenCalledWith(expect.stringContaining("  packages/example/llms.txt"));
    });

    it("lets a change that ships nothing through", () => {
      expect(checkChangesetCommand(range, deps(["packages/example/demo/App.tsx"], files))).toBe(0);
      expect(log).toHaveBeenCalledWith(expect.stringContaining("no publishable change"));
    });
  });

  it("reports a malformed config instead of throwing", () => {
    const files = { [join("/repo", "package.json")]: '{"repoConfig":{"changeset":1}}' };
    expect(checkChangesetCommand(range, deps([], files))).toBe(1);
    expect(error).toHaveBeenCalledWith(expect.stringContaining("repoConfig.changeset must be"));
  });
});

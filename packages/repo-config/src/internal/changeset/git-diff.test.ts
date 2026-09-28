import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { gitDiff } from "@/internal/changeset/git-diff";

/** A throwaway repository where a file moves out of its package; returns the two commits. */
const repoWithRename = (): { base: string; head: string } => {
  const dir = mkdtempSync(join(tmpdir(), "git-diff-"));
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", dir, ...args], { encoding: "utf8" }).trim();
  git("init", "-q");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  mkdirSync(join(dir, "packages/a"), { recursive: true });
  writeFileSync(join(dir, "packages/a/index.ts"), "export const a = 1;\n");
  git("add", ".");
  git("commit", "-q", "-m", "base");
  const base = git("rev-parse", "HEAD");
  git("mv", "packages/a/index.ts", "moved.ts");
  git("commit", "-q", "-m", "move");
  vi.stubEnv("GIT_DIR", join(dir, ".git"));
  vi.stubEnv("GIT_WORK_TREE", dir);
  return { base, head: git("rev-parse", "HEAD") };
};

describe("gitDiff", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("lists the files an empty range changed — none", () => {
    const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    expect(gitDiff(head, head)).toEqual([]);
    expect(gitDiff(head, head, { existing: true })).toEqual([]);
  });

  it("lists both sides of a rename, so a file moved out of a package still counts", () => {
    const { base, head } = repoWithRename();
    expect(gitDiff(base, head).sort()).toEqual(["moved.ts", "packages/a/index.ts"]);
    expect(gitDiff(base, head, { existing: true })).toEqual(["moved.ts"]);
  });
});

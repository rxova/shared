import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { versionPrCommand } from "@/changeset/version-pr-command";

const made: string[] = [];
const manifest = (root: string, dir: string, contents: object) => {
  mkdirSync(join(root, dir), { recursive: true });
  writeFileSync(join(root, dir, "package.json"), JSON.stringify(contents));
};

/** A workspace on disk with one changeset waiting and two packages. */
const repo = () => {
  const root = mkdtempSync(join(tmpdir(), "version-pr-"));
  made.push(root);
  mkdirSync(join(root, ".changeset"));
  writeFileSync(join(root, ".changeset", "README.md"), "# Changesets\n");
  writeFileSync(join(root, ".changeset", "a.md"), '---\n"@rxova/core": minor\n---\n\nAdd.\n');
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "root" }));
  manifest(root, "packages/core", { name: "@rxova/core", version: "1.0.0" });
  manifest(root, "packages/other", { name: "other", version: "2.0.0" });
  return root;
};

afterAll(() => {
  for (const dir of made) rmSync(dir, { recursive: true, force: true });
});

/**
 * Fake git and gh that record every call. `status` is what `git status
 * --porcelain` prints, `open` what `gh pr list` prints; the version script
 * bumps `@rxova/core` on disk.
 */
const setup = ({ status = " M packages/core/package.json", open = "" } = {}) => {
  const root = repo();
  const calls: string[] = [];
  const outputs: string[] = [];
  const deps = {
    root,
    run: (command: string) => {
      calls.push(`run ${command}`);
      manifest(root, "packages/core", { name: "@rxova/core", version: "1.1.0" });
    },
    tool: (command: string, args: readonly string[]) => {
      calls.push([command, ...args].join(" "));
      if (args[0] === "rev-parse") return "main";
      if (args[0] === "status") return status;
      if (command === "gh" && args[1] === "list") return open;
      if (command === "gh" && args[1] === "create") return "https://github.com/o/r/pull/12";
      return "";
    },
    append: (_file: string, contents: string) => {
      outputs.push(contents);
    },
  };
  return { root, calls, outputs, deps };
};

const BODY = "Merging this pull request versions these packages:\n\n- @rxova/core: 1.0.0 → 1.1.0";
const LIST =
  "gh pr list --head changeset-release/main --base main --state open --json number --jq .[0].number";

describe("versionPrCommand", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
    vi.spyOn(console, "error").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const env = { GITHUB_OUTPUT: "/out" };

  it("does nothing without pending changesets", () => {
    const { root, calls, outputs, deps } = setup();
    rmSync(join(root, ".changeset", "a.md"));
    expect(versionPrCommand(env, deps)).toBe(0);
    expect(calls).toEqual([]);
    expect(outputs).toEqual(["pull-request=\nchanged=false\n"]);
    expect(log).toEqual(["version-pr: no pending changesets, nothing to version"]);
  });

  it("stops before committing when versioning changed nothing", () => {
    const { calls, outputs, deps } = setup({ status: "" });
    expect(versionPrCommand(env, deps)).toBe(0);
    expect(calls).toEqual([
      "git rev-parse --abbrev-ref HEAD",
      "git switch -C changeset-release/main",
      "run pnpm exec changeset version",
      "git status --porcelain",
    ]);
    expect(outputs).toEqual(["pull-request=\nchanged=false\n"]);
    expect(log).toEqual(["version-pr: versioning changed nothing, nothing to commit"]);
  });

  it("commits, force-pushes and opens a new pull request", () => {
    const { calls, outputs, deps } = setup();
    expect(versionPrCommand(env, deps)).toBe(0);
    expect(calls).toEqual([
      "git rev-parse --abbrev-ref HEAD",
      "git switch -C changeset-release/main",
      "run pnpm exec changeset version",
      "git status --porcelain",
      "git add -A",
      "git commit -m chore: version packages",
      "git push --force origin changeset-release/main",
      LIST,
      `gh pr create --base main --head changeset-release/main --title chore: version packages --body ${BODY}`,
    ]);
    expect(outputs).toEqual(["pull-request=12\nchanged=true\n"]);
    expect(log).toEqual(["version-pr: opened https://github.com/o/r/pull/12"]);
  });

  it("updates the pull request already open from the branch", () => {
    const { calls, outputs, deps } = setup({ open: "7" });
    expect(versionPrCommand(env, deps)).toBe(0);
    expect(calls.at(-1)).toBe(`gh pr edit 7 --title chore: version packages --body ${BODY}`);
    expect(calls.some((call) => call.startsWith("gh pr create"))).toBe(false);
    expect(outputs).toEqual(["pull-request=7\nchanged=true\n"]);
    expect(log).toEqual(["version-pr: updated pull request #7"]);
  });

  it("takes the base, branch, script, message and title from the environment", () => {
    const { calls, deps } = setup({ open: "null" });
    const custom = {
      BASE_BRANCH: "develop",
      VERSION_BRANCH: "release/next",
      VERSION_SCRIPT: "pnpm run version",
      COMMIT_MESSAGE: "chore(release): version",
      PR_TITLE: "Release",
    };
    expect(versionPrCommand(custom, deps)).toBe(0);
    expect(calls).toEqual([
      "git switch -C release/next",
      "run pnpm run version",
      "git status --porcelain",
      "git add -A",
      "git commit -m chore(release): version",
      "git push --force origin release/next",
      "gh pr list --head release/next --base develop --state open --json number --jq .[0].number",
      `gh pr create --base develop --head release/next --title Release --body ${BODY}`,
    ]);
  });

  it("writes an empty pull-request when gh prints no URL, and no output without GITHUB_OUTPUT", () => {
    const { outputs, deps } = setup();
    const tool = (command: string, args: readonly string[]) =>
      command === "gh" && args[1] === "create" ? "" : deps.tool(command, args);
    expect(versionPrCommand(env, { ...deps, tool })).toBe(0);
    expect(outputs).toEqual(["pull-request=\nchanged=true\n"]);
    expect(versionPrCommand({}, { ...deps, tool })).toBe(0);
    expect(outputs).toHaveLength(1);
  });

  it("exits 1 with the message when a command fails, and writes no output", () => {
    const { calls, outputs, deps } = setup();
    const tool = (command: string, args: readonly string[]) => {
      if (args[0] === "push") throw new Error("Command failed: git push\nrejected");
      return deps.tool(command, args);
    };
    expect(versionPrCommand(env, { ...deps, tool })).toBe(1);
    expect(calls.some((call) => call.startsWith("gh"))).toBe(false);
    expect(outputs).toEqual([]);
    expect(log).toEqual(["version-pr failed — Command failed: git push\nrejected"]);
  });

  it("refuses a detached HEAD without BASE_BRANCH", () => {
    const { calls, deps } = setup();
    const tool = (command: string, args: readonly string[]) =>
      args[0] === "rev-parse" ? "HEAD" : deps.tool(command, args);
    expect(versionPrCommand(env, { ...deps, tool })).toBe(1);
    expect(calls).toEqual([]);
    expect(log.join("\n")).toContain("set BASE_BRANCH");
  });

  it("appends to GITHUB_OUTPUT on disk by default", () => {
    const { root, deps } = setup();
    rmSync(join(root, ".changeset", "a.md"));
    const output = join(root, "output");
    writeFileSync(output, "");
    expect(versionPrCommand({ GITHUB_OUTPUT: output }, { root, tool: deps.tool })).toBe(0);
    expect(readFileSync(output, "utf8")).toBe("pull-request=\nchanged=false\n");
  });
});

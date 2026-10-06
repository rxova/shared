import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { dependabotUpdateTypeCommand } from "@/dependabot/dependabot-update-type-command";

const metadata = (...entries: [name: string, type: string][]) =>
  [
    "chore(deps): bump",
    "",
    "---",
    "updated-dependencies:",
    ...entries.flatMap(([name, type]) => [
      `- dependency-name: ${name}`,
      "  dependency-type: direct:development",
      `  update-type: version-update:semver-${type}`,
    ]),
    "...",
  ].join("\n");

/** A fake git whose range holds `commits`, oldest first, by sha. */
const setup = (commits: Record<string, string>) => {
  const calls: string[] = [];
  const outputs: string[] = [];
  const deps = {
    tool: (command: string, args: readonly string[]) => {
      calls.push([command, ...args].join(" "));
      if (args[0] === "rev-list") return Object.keys(commits).join("\n");
      return commits[String(args.at(-1))] ?? "";
    },
    append: (_file: string, contents: string) => {
      outputs.push(contents);
    },
  };
  return { calls, outputs, deps };
};

const range = { BASE_SHA: "base", HEAD_SHA: "head", GITHUB_OUTPUT: "/out" };

describe("dependabotUpdateTypeCommand", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
    vi.spyOn(console, "error").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads a single minor update", () => {
    const { calls, outputs, deps } = setup({ a1: metadata(["vitest", "minor"]) });
    expect(dependabotUpdateTypeCommand(range, deps)).toBe(0);
    expect(calls).toEqual(["git rev-list --reverse base..head", "git log -1 --format=%B a1"]);
    expect(outputs).toEqual(["update-type=version-update:semver-minor\ndependency-names=vitest\n"]);
    expect(log).toEqual([
      "dependabot-update-type: update-type=version-update:semver-minor",
      "dependabot-update-type: dependency-names=vitest",
    ]);
  });

  it("reports the highest update of a group", () => {
    const { outputs, deps } = setup({
      a1: metadata(["a", "patch"], ["b", "minor"], ["c", "major"]),
    });
    expect(dependabotUpdateTypeCommand(range, deps)).toBe(0);
    expect(outputs).toEqual(["update-type=version-update:semver-major\ndependency-names=a,b,c\n"]);
  });

  it("writes an empty update-type for a commit without metadata", () => {
    const { outputs, deps } = setup({ a1: "chore: bump things by hand\n" });
    expect(dependabotUpdateTypeCommand(range, deps)).toBe(0);
    expect(outputs).toEqual(["update-type=\ndependency-names=\n"]);
  });

  it("writes an empty update-type for a malformed block", () => {
    const { outputs, deps } = setup({
      a1: "chore(deps): bump\n\n---\nupdated-dependencies:\n- dependency-name x\n  update-type: semver-major\n",
    });
    expect(dependabotUpdateTypeCommand(range, deps)).toBe(0);
    expect(outputs).toEqual(["update-type=\ndependency-names=\n"]);
  });

  it("reads the first commit of the range, not a later lockfile refresh", () => {
    const { calls, outputs, deps } = setup({
      first: metadata(["vitest", "patch"]),
      second: metadata(["vitest", "major"]),
    });
    expect(dependabotUpdateTypeCommand(range, deps)).toBe(0);
    expect(calls.at(-1)).toBe("git log -1 --format=%B first");
    expect(outputs).toEqual(["update-type=version-update:semver-patch\ndependency-names=vitest\n"]);
  });

  it("writes an empty update-type for an empty range, and prints without GITHUB_OUTPUT", () => {
    const { calls, outputs, deps } = setup({});
    expect(dependabotUpdateTypeCommand({ BASE_SHA: "a", HEAD_SHA: "b" }, deps)).toBe(0);
    expect(calls).toEqual(["git rev-list --reverse a..b"]);
    expect(outputs).toEqual([]);
    expect(log[0]).toBe("dependabot-update-type: update-type=");
  });

  it("refuses a missing range or one git would read as an option", () => {
    const { calls, deps } = setup({});
    expect(dependabotUpdateTypeCommand({ BASE_SHA: "a" }, deps)).toBe(1);
    expect(dependabotUpdateTypeCommand({ HEAD_SHA: "b" }, deps)).toBe(1);
    expect(dependabotUpdateTypeCommand({ BASE_SHA: "--upload-pack=x", HEAD_SHA: "b" }, deps)).toBe(
      1,
    );
    expect(dependabotUpdateTypeCommand({ BASE_SHA: "a", HEAD_SHA: "-b" }, deps)).toBe(1);
    expect(calls).toEqual([]);
    expect(log[0]).toBe("dependabot-update-type: BASE_SHA and HEAD_SHA must be set");
  });

  it("exits 1 with the message when git fails, and writes no output", () => {
    const { outputs } = setup({});
    const tool = () => {
      throw new Error("bad revision");
    };
    expect(dependabotUpdateTypeCommand(range, { tool, append: (_f, c) => outputs.push(c) })).toBe(
      1,
    );
    expect(outputs).toEqual([]);
    expect(log).toEqual(["dependabot-update-type failed — bad revision"]);
  });

  it("appends to GITHUB_OUTPUT on disk by default", () => {
    const dir = mkdtempSync(join(tmpdir(), "dependabot-update-type-"));
    const output = join(dir, "output");
    writeFileSync(output, "");
    const { deps } = setup({ a1: metadata(["x", "patch"]) });
    expect(
      dependabotUpdateTypeCommand({ ...range, GITHUB_OUTPUT: output }, { tool: deps.tool }),
    ).toBe(0);
    expect(readFileSync(output, "utf8")).toBe(
      "update-type=version-update:semver-patch\ndependency-names=x\n",
    );
    rmSync(dir, { recursive: true, force: true });
  });
});

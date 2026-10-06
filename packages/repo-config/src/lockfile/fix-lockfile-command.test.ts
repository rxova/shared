import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fixLockfileCommand } from "@/lockfile/fix-lockfile-command";

const STATUS = "git status --porcelain -- pnpm-lock.yaml";

/** A fake pnpm and git that record their calls; git reports `status` for the lockfile. */
const setup = (status = "") => {
  const ran: string[] = [];
  const outputs: [string, string][] = [];
  const deps = {
    run: (command: string) => {
      ran.push(command);
    },
    tool: (command: string, args: readonly string[]) => {
      ran.push([command, ...args].join(" "));
      return status;
    },
    env: { GITHUB_OUTPUT: "/out" },
    append: (file: string, contents: string) => {
      outputs.push([file, contents]);
    },
  };
  return { ran, outputs, deps };
};

describe("fixLockfileCommand", () => {
  let log: string[];
  beforeEach(() => {
    log = [];
    vi.spyOn(console, "log").mockImplementation((line: string) => log.push(line));
    vi.spyOn(console, "error").mockImplementation((line: string) => log.push(line));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("re-resolves, then dedupes, without running install scripts, then asks git", () => {
    const { ran, deps } = setup();
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(ran).toEqual([
      "pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts",
      "pnpm dedupe --ignore-scripts",
      STATUS,
    ]);
  });

  it("reports changed=true when git sees the lockfile modified", () => {
    const { outputs, deps } = setup("M pnpm-lock.yaml");
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(outputs).toEqual([["/out", "changed=true\n"]]);
    expect(log).toEqual(["fix-lockfile: pnpm-lock.yaml changed; commit it"]);
  });

  it("reports changed=false when git sees it clean", () => {
    const { outputs, deps } = setup();
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(outputs).toEqual([["/out", "changed=false\n"]]);
    expect(log).toEqual(["fix-lockfile: pnpm-lock.yaml was already up to date"]);
  });

  it("counts an untracked lockfile as a change, and prints without GITHUB_OUTPUT", () => {
    const { outputs, deps } = setup("?? pnpm-lock.yaml");
    expect(fixLockfileCommand({ ...deps, env: {} })).toBe(0);
    expect(outputs).toEqual([]);
    expect(log).toEqual(["fix-lockfile: pnpm-lock.yaml changed; commit it"]);
  });

  it("fails on the first pnpm command that fails, and writes no output", () => {
    const { ran, outputs, deps } = setup();
    const run = (command: string) => {
      deps.run(command);
      throw new Error("exit 1");
    };
    expect(fixLockfileCommand({ ...deps, run })).toBe(1);
    expect(ran).toEqual(["pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts"]);
    expect(outputs).toEqual([]);
    expect(log.join("\n")).toContain(
      "fix-lockfile failed — `pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts`: exit 1",
    );
  });

  it("fails when git does, and writes no output", () => {
    const { outputs, deps } = setup();
    const tool = () => {
      throw new Error("not a git repository");
    };
    expect(fixLockfileCommand({ ...deps, tool })).toBe(1);
    expect(outputs).toEqual([]);
    expect(log.join("\n")).toContain("fix-lockfile failed — `git status`: not a git repository");
  });

  it("appends to GITHUB_OUTPUT on disk by default", () => {
    const dir = mkdtempSync(join(tmpdir(), "fix-lockfile-"));
    const output = join(dir, "output");
    writeFileSync(output, "");
    const { deps } = setup();
    expect(
      fixLockfileCommand({ run: deps.run, tool: deps.tool, env: { GITHUB_OUTPUT: output } }),
    ).toBe(0);
    expect(readFileSync(output, "utf8")).toBe("changed=false\n");
    rmSync(dir, { recursive: true, force: true });
  });
});

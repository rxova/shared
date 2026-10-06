import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fixLockfileCommand } from "@/lockfile/fix-lockfile-command";

const ROOT = "/repo";
const LOCKFILE = join(ROOT, "pnpm-lock.yaml");

/** A lockfile held in memory, and a fake pnpm that records its calls and may rewrite the file. */
const setup = (
  rewrite?: (lockfile: string | undefined) => string,
  initial: string | undefined = "lockfileVersion: '9.0'\n",
) => {
  let lockfile = initial;
  const ran: string[] = [];
  const outputs: [string, string][] = [];
  const deps = {
    root: ROOT,
    read: (file: string) => (file === LOCKFILE ? lockfile : undefined),
    run: (command: string) => {
      ran.push(command);
      if (rewrite && command.startsWith("pnpm dedupe")) lockfile = rewrite(lockfile);
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

  it("re-resolves, then dedupes, without running install scripts", () => {
    const { ran, deps } = setup();
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(ran).toEqual([
      "pnpm install --lockfile-only --no-frozen-lockfile --ignore-scripts",
      "pnpm dedupe --ignore-scripts",
    ]);
  });

  it("reports changed=true when the lockfile's contents moved", () => {
    const { outputs, deps } = setup((lockfile) => `${String(lockfile)}packages: {}\n`);
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(outputs).toEqual([["/out", "changed=true\n"]]);
    expect(log).toEqual(["fix-lockfile: pnpm-lock.yaml changed; commit it"]);
  });

  it("reports changed=false when they did not", () => {
    const { outputs, deps } = setup();
    expect(fixLockfileCommand(deps)).toBe(0);
    expect(outputs).toEqual([["/out", "changed=false\n"]]);
    expect(log).toEqual(["fix-lockfile: pnpm-lock.yaml was already up to date"]);
  });

  it("counts a lockfile that appears as a change, and prints without GITHUB_OUTPUT", () => {
    const { outputs, deps } = setup(() => "new\n", undefined);
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

  it("reads the lockfile and appends to GITHUB_OUTPUT on disk by default", () => {
    const dir = mkdtempSync(join(tmpdir(), "fix-lockfile-"));
    writeFileSync(join(dir, "pnpm-lock.yaml"), "a\n");
    const output = join(dir, "output");
    writeFileSync(output, "");
    expect(fixLockfileCommand({ root: dir, run: () => {}, env: { GITHUB_OUTPUT: output } })).toBe(
      0,
    );
    expect(readFileSync(output, "utf8")).toBe("changed=false\n");
    rmSync(dir, { recursive: true, force: true });
  });
});

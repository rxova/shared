import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { main } from "@/hooks/hooks-entry";

const bash = (command: string) => JSON.stringify({ tool_name: "Bash", tool_input: { command } });
const io = (stdin: () => string) => ({ stdin, stdout: vi.fn(), stderr: vi.fn() });

describe("main", () => {
  it("runs the named hook over stdin and reports a block on stderr", () => {
    const streams = io(() => bash("git commit -n"));
    expect(main(["no-bypass"], streams)).toBe(2);
    expect(streams.stderr).toHaveBeenCalledWith(expect.stringContaining("no-bypass"));
    expect(streams.stdout).not.toHaveBeenCalled();
  });

  it("writes a hook’s reply to stdout", () => {
    const streams = io(() => "{}");
    expect(main(["x"], streams, () => ({ code: 0, stdout: "reply" }))).toBe(0);
    expect(streams.stdout).toHaveBeenCalledWith("reply");
  });

  it("exits 0 quietly when the call is allowed, stdin fails, or no hook is named", () => {
    const allowed = io(() => bash("git status"));
    expect(main(["no-bypass"], allowed)).toBe(0);
    const failing = io(() => {
      throw new Error("closed");
    });
    expect(main(["no-bypass"], failing)).toBe(0);
    expect(
      main(
        [],
        io(() => bash("git commit -n")),
      ),
    ).toBe(0);
    expect(allowed.stderr).not.toHaveBeenCalled();
  });
});

// Spawning Node with tsx can take several seconds on a cold CI runner.
const SPAWN_TIMEOUT = 60_000;

describe("the runner as a process", () => {
  const script = fileURLToPath(new URL("./hooks-entry.ts", import.meta.url));
  const run = (hook: string, input: string) =>
    spawnSync(process.execPath, ["--import", "tsx", script, hook], { input, encoding: "utf8" });

  it(
    "exits 2 with the reason on stderr, or 0",
    () => {
      const blocked = run("no-bypass", bash("git push --no-verify"));
      expect(blocked.status).toBe(2);
      expect(blocked.stderr).toContain("rx-ai no-bypass");
      expect(run("no-bypass", bash("git push")).status).toBe(0);
    },
    SPAWN_TIMEOUT,
  );
});

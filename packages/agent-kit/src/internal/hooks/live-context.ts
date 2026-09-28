import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { HookContext } from "@/hooks/hook.types";

/** The real file system, processes, environment and clock, for the runner. */
export const liveContext = (
  stateDir = join(homedir(), ".claude", "rx-ai", "state"),
): HookContext => ({
  exists: (path) => existsSync(path),
  read: (path) => {
    try {
      return readFileSync(path, "utf8");
    } catch {
      return undefined;
    }
  },
  write: (path, text) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  },
  remove: (path) => {
    rmSync(path, { force: true });
  },
  list: (dir) => {
    try {
      return readdirSync(dir);
    } catch {
      return [];
    }
  },
  run: (program, args, cwd, timeoutMs = 20_000) => {
    const result = spawnSync(program, args, { cwd, encoding: "utf8", timeout: timeoutMs });
    return {
      status: result.error === undefined ? result.status : null,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  },
  env: process.env,
  now: () => new Date(),
  platform: process.platform,
  stateDir,
});

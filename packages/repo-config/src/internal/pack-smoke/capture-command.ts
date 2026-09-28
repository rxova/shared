import { execFileSync } from "node:child_process";
import type { Shell } from "@/pack-smoke/pack-smoke.types";

/** Runs a command in `cwd` and returns what it printed; throws when it fails. */
export const captureCommand: Shell = (command, args, cwd) =>
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

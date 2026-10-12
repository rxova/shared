import { execSync } from "node:child_process";
import type { DryRun } from "@/verify/verify.types";

/**
 * Runs `command --dry=json` in the user's shell and returns its output; turbo's
 * own messages still reach stderr. Throws when it fails. A monorepo's plan runs
 * to megabytes, hence the buffer.
 */
export const readDryRun: DryRun = (command) =>
  execSync(`${command} --dry=json`, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "inherit"],
    maxBuffer: 256 * 1024 * 1024,
  });

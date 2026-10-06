import { execSync } from "node:child_process";
import type { Runner } from "@/verify/verify.types";

/**
 * Runs a gate step in the user's shell, streaming its output, in `env` when
 * given; throws when it fails.
 */
export const runCommand: Runner = (command, env) => {
  execSync(command, env === undefined ? { stdio: "inherit" } : { stdio: "inherit", env });
};

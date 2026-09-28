import { execSync } from "node:child_process";
import type { Runner } from "@/verify/verify.types";

/** Runs a gate step in the user's shell, streaming its output; throws when it fails. */
export const runCommand: Runner = (command) => {
  execSync(command, { stdio: "inherit" });
};

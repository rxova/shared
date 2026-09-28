import { execFileSync } from "node:child_process";
import type { Tool } from "@/init/init.types";

/** Runs `command` without a shell and returns its stdout, trimmed. */
export const runTool: Tool = (command, args) =>
  execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();

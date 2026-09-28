import type { Guard } from "@/hooks/hook.types";
import { allow } from "@/internal/hooks/allow";
import { bashCommand } from "@/internal/hooks/bash-command";
import { longRunning } from "@/internal/hooks/long-running";
import { shellSegments } from "@/internal/shell/shell-segments";

/**
 * Stops a dev server or watcher started in the foreground, where it would hang the session until
 * the tool times out. Started in the background, it passes.
 */
export const devServer: Guard = (input) => {
  const command = bashCommand(input);
  if (command === undefined || input.tool_input?.run_in_background === true) return allow;
  if (!shellSegments(command).some(longRunning) || /&\s*$/.test(command.trim())) return allow;
  return {
    block: true,
    reason:
      "This starts a process that never exits. Run it with run_in_background: true and read its " +
      "output from there, or ask the user to start it in their own terminal.",
  };
};

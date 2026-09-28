import { resolve } from "node:path";
import type { Guard } from "@/hooks/hook.types";
import { allow } from "@/internal/hooks/allow";
import { bashCommand } from "@/internal/hooks/bash-command";
import { carriesAttribution } from "@/internal/hooks/carries-attribution";
import { messageFiles } from "@/internal/hooks/message-files";
import { shellSegments } from "@/internal/shell/shell-segments";

/**
 * Stops a commit or a pull request whose message or body credits an AI assistant: a
 * `Co-Authored-By` naming Claude, a session trailer, a "Generated with Claude" footer or 🤖.
 * Reads the command itself, heredocs included, and any message or body file it names.
 */
export const noAttribution: Guard = (input, context) => {
  const command = bashCommand(input);
  if (command === undefined) return allow;
  const named = shellSegments(command).map(messageFiles);
  if (named.every((entry) => entry === undefined)) return allow;

  const texts = [
    command,
    ...named
      .flatMap((entry) => entry ?? [])
      .filter((file) => file !== "" && file !== "-")
      .map((file) => context.read(resolve(input.cwd ?? ".", file)) ?? ""),
  ];
  if (!texts.some(carriesAttribution)) return allow;
  return {
    block: true,
    reason:
      "The message or body credits an AI assistant. Remove the trailer, footer or badge " +
      "and run it again.",
  };
};

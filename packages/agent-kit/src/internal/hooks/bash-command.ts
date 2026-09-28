import type { HookInput } from "@/hooks/hook.types";

/** The command of a Bash tool call, or undefined for any other call. */
export const bashCommand = (input: HookInput): string | undefined => {
  if (input.tool_name !== "Bash") return undefined;
  const command = input.tool_input?.command;
  return typeof command === "string" ? command : undefined;
};

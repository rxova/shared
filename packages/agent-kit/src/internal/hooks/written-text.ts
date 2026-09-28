import type { HookInput } from "@/hooks/hook.types";

/** The new text an Edit, Write or MultiEdit call would put in the file. */
export const writtenText = ({ tool_name, tool_input = {} }: HookInput): string => {
  const pick = (value: unknown) => (typeof value === "string" ? value : "");
  if (tool_name === "Write") return pick(tool_input.content);
  if (tool_name === "Edit") return pick(tool_input.new_string);
  if (tool_name === "MultiEdit" && Array.isArray(tool_input.edits))
    return (tool_input.edits as unknown[])
      .map((edit) =>
        typeof edit === "object" && edit !== null
          ? pick((edit as Record<string, unknown>).new_string)
          : "",
      )
      .join("\n");
  return "";
};

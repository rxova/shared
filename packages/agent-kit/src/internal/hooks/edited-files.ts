import { isRecord } from "@/internal/install/is-record";
import { messageBlocks } from "@/internal/hooks/message-blocks";
import { EDITS } from "@/internal/hooks/edit-tools";

/** Every file the assistant edited or wrote in the transcript, once each, in first-touched order. */
export const editedFiles = (entries: readonly Record<string, unknown>[]): string[] => [
  ...new Set(
    entries
      .filter((entry) => entry.type === "assistant")
      .flatMap(messageBlocks)
      .filter((block) => block.type === "tool_use" && EDITS.has(String(block.name)))
      .map((block) =>
        isRecord(block.input) ? (block.input.file_path ?? block.input.notebook_path) : undefined,
      )
      .filter((path): path is string => typeof path === "string"),
  ),
];

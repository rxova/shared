import type { GitCall } from "@/internal/shell/shell.types";
import {
  COMMIT_VALUE_LETTERS,
  COMMIT_VALUE_OPTIONS,
  VALUE_OPTIONS,
} from "@/internal/hooks/verification-options";

/**
 * Whether the call skips the repository's git hooks through its own arguments: `--no-verify`
 * anywhere, or `-n` in a `git commit` short-option cluster. Values of message and file options
 * are passed over, so a message that mentions `--no-verify` is fine.
 */
export const skipsVerification = ({ subcommand, args }: GitCall): boolean => {
  const isCommit = subcommand === "commit";
  const valueOptions = isCommit ? COMMIT_VALUE_OPTIONS : VALUE_OPTIONS;
  let isValue = false;
  for (const arg of args) {
    if (isValue) {
      isValue = false;
      continue;
    }
    if (arg === "--") return false;
    if (arg === "--no-verify") return true;
    isValue = valueOptions.has(arg);
    if (isValue || !isCommit || !/^-[^-]/.test(arg)) continue;
    for (const letter of arg.slice(1)) {
      if (letter === "n") return true;
      if (COMMIT_VALUE_LETTERS.includes(letter)) {
        isValue = arg.endsWith(letter);
        break;
      }
    }
  }
  return false;
};

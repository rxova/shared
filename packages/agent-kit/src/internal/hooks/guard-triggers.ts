// Where the blocking guards hook in: before a shell command, and before a file is changed.
export const BASH_TRIGGERS = [{ event: "PreToolUse", matcher: "Bash" }] as const;

export const EDIT_TRIGGERS = [{ event: "PreToolUse", matcher: "Edit|Write|MultiEdit" }] as const;

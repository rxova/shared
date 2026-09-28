/** What Claude Code writes to a hook's stdin, as far as the guards read it. */
export interface HookInput {
  tool_name?: string;
  tool_input?: Record<string, unknown>;
  cwd?: string;
}

/** Let the tool call through, or stop it and tell the agent why. */
export type Verdict = { block: false } | { block: true; reason: string };

/** The file system, as the guards need it; a fake in tests. */
export interface GuardFiles {
  exists: (path: string) => boolean;
  /** The file's text, or undefined when it cannot be read. */
  read: (path: string) => string | undefined;
}

export type Guard = (input: HookInput, files: GuardFiles) => Verdict;

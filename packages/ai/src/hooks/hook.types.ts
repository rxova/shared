/** What Claude Code writes to a hook's stdin, as far as these hooks read it. */
export interface HookInput {
  hook_event_name?: string;
  session_id?: string;
  transcript_path?: string;
  cwd?: string;
  tool_name?: string;
  tool_input?: Record<string, unknown>;
}

/** The events the kit hooks into. */
export type HookEvent = 'PreToolUse' | 'PostToolUse' | 'PreCompact' | 'SessionStart' | 'SessionEnd';

/** A finished child process. */
export interface RunResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/** Everything a hook may touch outside its input; the real thing in the runner, fakes in tests. */
export interface HookContext {
  exists: (path: string) => boolean;
  /** The file's text, or undefined when it cannot be read. */
  read: (path: string) => string | undefined;
  write: (path: string, text: string) => void;
  remove: (path: string) => void;
  /** The files in a directory (names only), or none when it cannot be read. */
  list: (dir: string) => string[];
  /** Runs a program without a shell; `status` is null when it could not start or timed out. */
  run: (program: string, args: readonly string[], cwd: string, timeoutMs?: number) => RunResult;
  env: Record<string, string | undefined>;
  now: () => Date;
  platform: NodeJS.Platform;
  /** A directory the hooks may keep small state files in. */
  stateDir: string;
}

/** Let the tool call through, or stop it and tell the agent why. */
export type Verdict = { block: false } | { block: true; reason: string };

/** A `PreToolUse` check: looks at the call and decides. */
export type Guard = (input: HookInput, context: HookContext) => Verdict;

/**
 * What the hook process does: its exit code, a line for stderr (shown to the agent when the
 * code is 2), and text for stdout (read as context or as a JSON reply, depending on the event).
 */
export interface HookOutcome {
  code: 0 | 2;
  message?: string;
  stdout?: string;
}

/** Where a hook hooks in: an event, and for the tool events the tools it watches. */
export interface HookTrigger {
  event: HookEvent;
  /** Tool names for the tool events, a trigger for the others; omitted to match everything. */
  matcher?: string;
}

/** One hook the kit ships: where it hooks in, how long it may take, and its work. */
export interface HookSpec {
  on: readonly HookTrigger[];
  /** Seconds Claude Code waits before giving up on it. */
  timeout: number;
  /** One line for `rxova-ai list`. */
  summary: string;
  run: (input: HookInput, context: HookContext) => HookOutcome;
}

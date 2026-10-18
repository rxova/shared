import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { OpencodeSession, StatusFacts } from "@/internal/statusline/statusline.types";
import { opencodeInput } from "@/internal/statusline/opencode-input";
import { readGit } from "@/internal/statusline/read-git";
import { sessionHistory } from "@/internal/statusline/session-history";

/* v8 ignore start -- the process shell around `readGit`; the tests inject their own runner. */
/** Runs git for `readGit`, and gives nothing back where git is missing or the call fails. */
const gitOutput =
  (cwd: string) =>
  (args: readonly string[]): string | undefined => {
    try {
      return execFileSync("git", args, {
        cwd: cwd === "" ? undefined : cwd,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 1500,
        env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
      });
    } catch {
      return undefined;
    }
  };
/* v8 ignore stop */

/**
 * The facts the rows need beside the session: the working tree, the context history behind the
 * sparkline, the clock and the width. OpenCode's own VCS surface reports only the branch, so git
 * is read directly, the same way the Claude Code script reads it. `run` is injected by the tests;
 * it defaults to running git in the session's directory.
 */
export const opencodeFacts = (
  session: OpencodeSession,
  now: number = Math.floor(Date.now() / 1000),
  run: (args: readonly string[]) => string | undefined = gitOutput(session.cwd ?? ""),
  dir: string = join(tmpdir(), "rx-ai-statusline"),
): StatusFacts => ({
  git: readGit(session.cwd ?? "", run),
  history: sessionHistory(dir, session.sessionId ?? "", opencodeInput(session, now).contextTokens),
  now,
  columns: Math.max(1, (session.columns ?? 120) - 4),
  // The rows carry their colour as hex, so nothing here is painted with escape codes.
  mode: "none",
});

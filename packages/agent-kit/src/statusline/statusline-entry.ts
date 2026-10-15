#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { renderStatusline } from "@/statusline/render-statusline";
import type { StatusFacts } from "@/internal/statusline/statusline.types";
import { isEntry } from "@/internal/entry/is-entry";
import { colorMode } from "@/internal/statusline/color-mode";
import { readGit } from "@/internal/statusline/read-git";
import { readStatusInput } from "@/internal/statusline/read-status-input";
import { sessionHistory } from "@/internal/statusline/session-history";

/**
 * The status line script the installer copies into `.claude/rx-ai/`, built as one file that
 * imports only Node: reads Claude Code's status JSON from `stdin`, gathers git state and the
 * session's context history through `facts`, and returns the rows to print.
 */
export const main = (
  stdin: string,
  facts: (input: ReturnType<typeof readStatusInput>) => StatusFacts,
): string => {
  const input = readStatusInput(stdin);
  return renderStatusline(input, facts(input)).join("\n");
};

/* v8 ignore start -- the process shell around `main`; the end-to-end test spawns it. */
if (isEntry(import.meta.url)) {
  const env = process.env;
  let stdin: string;
  try {
    stdin = readFileSync(0, "utf8");
  } catch {
    stdin = "{}";
  }
  const columns = Number.parseInt(env.COLUMNS ?? "", 10);
  process.stdout.write(
    `${main(stdin, (input) => ({
      git: readGit(input.cwd, (args) => {
        try {
          return execFileSync("git", args, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 1500,
            env: { ...env, GIT_OPTIONAL_LOCKS: "0" },
          });
        } catch {
          return undefined;
        }
      }),
      history: sessionHistory(
        join(tmpdir(), "rx-ai-statusline"),
        input.sessionId,
        input.contextTokens,
      ),
      now: Math.floor(Date.now() / 1000),
      columns: (Number.isNaN(columns) ? 120 : columns) - 4,
      mode: colorMode(env),
    }))}\n`,
  );
}
/* v8 ignore stop */

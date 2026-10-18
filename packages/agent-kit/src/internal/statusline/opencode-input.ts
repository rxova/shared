import type { OpencodeSession, StatusInput } from "@/internal/statusline/statusline.types";
import { readStatusInput } from "@/internal/statusline/read-status-input";

/**
 * One OpenCode session as the status input the segments already read. OpenCode counts the window
 * the way its own display does — prompt, generated, reasoning and both cache sides — and reports
 * no rate limits, so those segments simply stay empty rather than being faked. `now` is unix
 * epoch seconds, so the elapsed clock is the caller's to decide and a test can pin it.
 */
export const opencodeInput = (session: OpencodeSession, now: number): StatusInput => {
  const { tokens } = session;
  const used =
    tokens === undefined
      ? undefined
      : (tokens.input ?? 0) +
        (tokens.output ?? 0) +
        (tokens.reasoning ?? 0) +
        (tokens.cache?.read ?? 0) +
        (tokens.cache?.write ?? 0);
  const read = tokens?.cache?.read ?? 0;
  const cwd = session.cwd ?? "";
  return {
    ...readStatusInput("{}"),
    sessionId: session.sessionId ?? "",
    model: session.model ?? "OpenCode",
    modelId: session.model ?? "",
    version: session.version,
    cwd,
    projectDir: session.projectDir ?? cwd,
    contextSize: session.contextSize ?? 200_000,
    contextTokens: used,
    costUsd: session.costUsd,
    durationMs:
      session.startedAt === undefined ? undefined : Math.max(0, (now - session.startedAt) * 1000),
    cache:
      used === undefined || used <= 0 || read <= 0
        ? undefined
        : { hitRatio: read / used, warm: true },
  };
};

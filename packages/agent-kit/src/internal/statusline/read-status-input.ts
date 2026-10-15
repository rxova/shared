import type { Limit, StatusInput } from "@/internal/statusline/statusline.types";
import { valueAt } from "@/internal/statusline/value-at";

/** Claude Code's status line JSON as `StatusInput`, tolerating any field missing or mistyped. */
export const readStatusInput = (raw: string): StatusInput => {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    json = {};
  }
  const num = (...path: string[]) => {
    const value = valueAt(json, ...path);
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  };
  const str = (...path: string[]) => {
    const value = valueAt(json, ...path);
    return typeof value === "string" && value !== "" ? value : undefined;
  };
  const cwd = str("workspace", "current_dir") ?? str("cwd") ?? "";
  const modelId = str("model", "id") ?? "";
  const owner = str("workspace", "repo", "owner");
  const name = str("workspace", "repo", "name");
  const usage = ["input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"].map(
    (key) => num("context_window", "current_usage", key),
  );
  const size =
    num("context_window", "context_window_size") ?? (modelId.includes("[1m]") ? 1e6 : 200_000);
  const percent = num("context_window", "used_percentage");
  const limits: Limit[] = [];
  for (const [key, label, windowSeconds] of [
    ["five_hour", "5h", 5 * 3600],
    ["seven_day", "7d", 7 * 86_400],
  ] as const) {
    const usedPercentage = num("rate_limits", key, "used_percentage");
    if (usedPercentage !== undefined)
      limits.push({
        label,
        usedPercentage,
        resetsAt: num("rate_limits", key, "resets_at"),
        windowSeconds,
      });
  }
  const spendPercentage = num("rate_limits", "spend_limit", "used_percentage");
  const prNumber = num("pr", "number");
  const hasCache = valueAt(json, "prompt_cache") !== undefined;
  const addedDirs = valueAt(json, "workspace", "added_dirs");
  return {
    sessionId: str("session_id") ?? "",
    model: (str("model", "display_name") ?? (modelId || "Claude")).replace(/^Claude /, ""),
    modelId,
    version: str("version"),
    cwd,
    projectDir: str("workspace", "project_dir") ?? cwd,
    repo: owner !== undefined && name !== undefined ? `${owner}/${name}` : undefined,
    worktree: str("workspace", "git_worktree") ?? str("worktree", "name"),
    addedDirs: Array.isArray(addedDirs) ? addedDirs.length : 0,
    outputStyle: str("output_style", "name"),
    agent: str("agent", "name"),
    vimMode: str("vim", "mode"),
    sessionName: str("session_name"),
    fastMode: valueAt(json, "fast_mode") === true,
    thinking: valueAt(json, "thinking", "enabled") === true,
    effort: str("effort", "level"),
    costUsd: num("cost", "total_cost_usd"),
    durationMs: num("cost", "total_duration_ms"),
    apiDurationMs: num("cost", "total_api_duration_ms"),
    linesAdded: num("cost", "total_lines_added") ?? 0,
    linesRemoved: num("cost", "total_lines_removed") ?? 0,
    contextSize: size,
    contextTokens: usage.some((value) => value !== undefined)
      ? usage.reduce<number>((sum, value) => sum + (value ?? 0), 0)
      : percent === undefined
        ? undefined
        : Math.round((percent / 100) * size),
    cache: hasCache
      ? {
          hitRatio: num("prompt_cache", "hit_ratio"),
          ttl: str("prompt_cache", "ttl"),
          expiresAt: num("prompt_cache", "expires_at"),
          warm: valueAt(json, "prompt_cache", "warm") === true,
        }
      : undefined,
    limits,
    spend:
      spendPercentage === undefined
        ? undefined
        : {
            usedPercentage: spendPercentage,
            usedUsd: num("rate_limits", "spend_limit", "used_usd"),
            limitUsd: num("rate_limits", "spend_limit", "limit_usd"),
            period: str("rate_limits", "spend_limit", "period"),
          },
    pr:
      prNumber === undefined
        ? undefined
        : {
            number: prNumber,
            url: str("pr", "url"),
            reviewState: str("pr", "review_state"),
            kind: str("pr", "kind"),
          },
  };
};

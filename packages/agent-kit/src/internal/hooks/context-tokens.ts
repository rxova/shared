import { isRecord } from "@/internal/install/is-record";

/**
 * How many tokens the last assistant turn sent as input (fresh, cache writes and cache reads):
 * how full the context window was. Undefined when no turn reports usage.
 */
export const contextTokens = (entries: readonly Record<string, unknown>[]): number | undefined => {
  for (const entry of [...entries].reverse()) {
    const usage = isRecord(entry.message) ? entry.message.usage : undefined;
    if (!isRecord(usage)) continue;
    const count = (key: string) => (typeof usage[key] === "number" ? usage[key] : 0);
    return (
      count("input_tokens") +
      count("cache_creation_input_tokens") +
      count("cache_read_input_tokens")
    );
  }
  return undefined;
};

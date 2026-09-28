import type { GitCall } from "@/internal/shell/shell.types";
import { CONFIG_READS } from "@/internal/hooks/config-reads";

/**
 * Whether the call points git at another hooks directory, or clears the one the repository set:
 * `git -c core.hooksPath=…`, or `git config` writing or unsetting `core.hooksPath`.
 */
export const movesHooksPath = ({ config, subcommand, args }: GitCall): boolean => {
  if (config.some((entry) => /^core\.hookspath=/i.test(entry))) return true;
  if (subcommand !== "config") return false;
  return (
    args.some((arg) => arg.toLowerCase() === "core.hookspath") &&
    !args.some((arg) => CONFIG_READS.has(arg))
  );
};

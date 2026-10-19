import type { CommandEntry } from "@/cli/cli.types";

/** One command's `--help`: how to call it, then what it does. */
export const commandUsage = (name: string, { summary, flags }: CommandEntry): string =>
  [
    `usage: rxova-agent-kit ${name}${flags === undefined ? "" : ` ${flags}`}`,
    "",
    `  ${summary}`,
  ].join("\n");

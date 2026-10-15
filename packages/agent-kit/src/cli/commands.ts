import type { CommandEntry } from "@/cli/cli.types";

/** Every `rxova-agent-kit` command, by name, each loaded when it runs. */
export const commands = (): Record<string, CommandEntry> => ({
  list: {
    summary: "show every agent, skill and hook, and which profiles include it [--profile p]",
    load: async () => {
      const { listCommand } = await import("@/install/list-command");
      return (argv) => listCommand(argv);
    },
  },
  install: {
    summary:
      "install a profile (core, hackathon, dotnet, react, qa, marketing, full, none) for Claude Code, OpenCode or both [--target claude|opencode|both] [--profile p] [--add a,b] [--skip c] [--statusline | --no-statusline] [--project] [--dry-run] [--force]",
    load: async () => {
      const { installCommand } = await import("@/install/install-command");
      return (argv) => installCommand(argv);
    },
  },
  statusline: {
    summary:
      "install only the status line, with no agent, skill or hook; keeps an existing install as it is [--project] [--remove] [--dry-run] [--force]",
    load: async () => {
      const { statuslineCommand } = await import("@/install/statusline-command");
      return (argv) => statuslineCommand(argv);
    },
  },
  uninstall: {
    summary: "remove everything the last install wrote [--target t] [--project] [--dry-run]",
    load: async () => {
      const { uninstallCommand } = await import("@/install/uninstall-command");
      return (argv) => uninstallCommand(argv);
    },
  },
  status: {
    summary:
      "show each installed target’s profile and anything missing or changed [--target t] [--project]",
    load: async () => {
      const { statusCommand } = await import("@/install/status-command");
      return (argv) => statusCommand(argv);
    },
  },
});

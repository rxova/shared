import type { CommandEntry } from '@/cli/cli.types';

/** Every `rxova-ai` command, by name, each loaded when it runs. */
export const commands = (): Record<string, CommandEntry> => ({
  install: {
    summary:
      'copy the agents, skills and hook runner and register the hooks [--project] [--dry-run] [--force]',
    load: async () => {
      const { installCommand } = await import('@/install/install-command');
      return (argv) => installCommand(argv);
    },
  },
  uninstall: {
    summary: 'remove everything the last install wrote [--project] [--dry-run]',
    load: async () => {
      const { uninstallCommand } = await import('@/install/uninstall-command');
      return (argv) => uninstallCommand(argv);
    },
  },
  status: {
    summary: 'show what is installed and what is missing or changed [--project]',
    load: async () => {
      const { statusCommand } = await import('@/install/status-command');
      return (argv) => statusCommand(argv);
    },
  },
});

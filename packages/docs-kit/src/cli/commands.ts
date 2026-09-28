import type { CommandEntry } from '@/cli/cli.types';

/** Every `rxova-docs-kit` command, by name, each loaded on demand. */
export const commands = (): Record<string, CommandEntry> => ({
  'check-md-routes': {
    summary:
      'check the .md twins and llms.txt budgets of a built site [dist] [--untwinned a,b/] [--max-full 800k] [--max-index 24k] [--components A,B]',
    load: async () => {
      const { checkMdRoutesCommand } = await import('@/check/check-md-routes-command');
      return (argv) => checkMdRoutesCommand(argv);
    },
  },
});

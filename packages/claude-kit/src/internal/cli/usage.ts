import type { CommandEntry } from '@/cli/cli.types';

/** The `--help` text: each command beside its summary. */
export const usage = (commands: Record<string, CommandEntry>): string => {
  const width = Math.max(...Object.keys(commands).map((name) => name.length));
  return [
    'usage: rxova-claude-kit <command> [options]',
    '',
    ...Object.entries(commands).map(([name, { summary }]) => `  ${name.padEnd(width)}  ${summary}`),
  ].join('\n');
};

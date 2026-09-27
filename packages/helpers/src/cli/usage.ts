import type { CommandEntry } from '@rxova-tooling/cli/cli.types';

/** The `--help` text: every command with its one-line summary, aligned. */
export const usage = (commands: Record<string, CommandEntry>): string => {
  const width = Math.max(...Object.keys(commands).map((name) => name.length));
  return [
    'usage: rxova-tooling <command> [args]',
    '',
    ...Object.entries(commands).map(([name, { summary }]) => `  ${name.padEnd(width)}  ${summary}`),
  ].join('\n');
};

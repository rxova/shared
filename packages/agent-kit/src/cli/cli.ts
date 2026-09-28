#!/usr/bin/env node
import { consoleIo } from '@/internal/cli/console-io';
import { packageVersion } from '@/internal/cli/package-version';
import { usage } from '@/internal/cli/usage';
import type { CommandEntry, Io } from '@/cli/cli.types';
import { commands } from '@/cli/commands';
import { isEntry } from '@/internal/entry/is-entry';

/**
 * `rxova-agent-kit <command>`: installs, inspects and removes the kit. Picks the command by name and
 * hands it the rest of the arguments; returns the exit code rather than setting it, so tests
 * can call it.
 */
export const cli = async (
  argv: readonly string[],
  {
    table = commands(),
    io = consoleIo,
    version = () => packageVersion(import.meta.url),
  }: { table?: Record<string, CommandEntry>; io?: Io; version?: () => string } = {},
): Promise<number> => {
  const [name, ...rest] = argv;
  if (name === '--version' || name === '-v') {
    io.out(version());
    return 0;
  }
  if (name === undefined || name === '--help' || name === '-h') {
    io.out(usage(table));
    return 0;
  }
  const command = Object.hasOwn(table, name) ? table[name] : undefined;
  if (command === undefined) {
    io.err(`rxova-agent-kit: unknown command "${name}"\n\n${usage(table)}`);
    return 1;
  }
  return (await command.load())(rest);
};

/* v8 ignore start -- the process shell around `cli`; the bin test spawns it. */
if (isEntry(import.meta.url)) {
  process.exitCode = await cli(process.argv.slice(2));
}
/* v8 ignore stop */

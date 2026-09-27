#!/usr/bin/env node
import { consoleIo } from '@rxova-helpers/cli/console-io';
import { ownVersion } from '@rxova-helpers/cli/own-version';
import { usage } from '@rxova-helpers/cli/usage';
import type { CommandEntry, Io } from '@/cli/cli.types';
import { commands } from '@/cli/commands';
import { isEntry } from '@/entry/is-entry';

/**
 * `rxova-tooling <command>`: every repo script behind one bin, so a repository
 * installs one dev dependency instead of carrying a copy of each. Picks the
 * command by name and hands it the rest of the arguments. Returns the process
 * exit code rather than taking it, so tests can call it.
 */
export const cli = async (
  argv: readonly string[],
  {
    table = commands(),
    io = consoleIo,
    version = () => ownVersion(import.meta.url),
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
    io.err(`rxova-tooling: unknown command "${name}"\n\n${usage(table)}`);
    return 1;
  }
  return (await command.load())(rest);
};

/* v8 ignore start -- the entry shell; `cli` is what the tests call, and the
   bin test spawns this file. */
if (isEntry(import.meta.url)) {
  process.exitCode = await cli(process.argv.slice(2));
}
/* v8 ignore stop */

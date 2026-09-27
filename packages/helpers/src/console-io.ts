import type { Io } from '../../tooling/src/cli.types.ts';

/** stdout and stderr, for the CLI's own messages. */
export const consoleIo: Io = {
  out: (line) => {
    console.log(line);
  },
  err: (line) => {
    console.error(line);
  },
};

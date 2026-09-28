import type { Io } from '@/cli/cli.types';

/** stdout and stderr, for the CLI's own messages. */
export const consoleIo: Io = {
  out: (line) => {
    console.log(line);
  },
  err: (line) => {
    console.error(line);
  },
};

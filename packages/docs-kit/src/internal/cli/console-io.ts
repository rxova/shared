import type { Io } from "@/cli/cli.types";

/** stdout and stderr, for the CLI's own messages. */
export const consoleIo: Io = {
  out: (line) => {
    // The bin's output contract is its stdout.
    // eslint-disable-next-line no-console
    console.log(line);
  },
  err: (line) => {
    // The bin reports its failures on stderr.
    // eslint-disable-next-line no-console
    console.error(line);
  },
};

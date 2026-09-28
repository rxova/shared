import { readFileSync } from "node:fs";

/**
 * Everything on standard input, or nothing when it is a terminal: a hook run
 * by hand has no git input to wait for, and reading a TTY would block.
 */
export const readStdin = (
  stdin: { isTTY?: boolean } = process.stdin,
  read: (fd: number, encoding: "utf8") => string = readFileSync,
): string | undefined => (stdin.isTTY === true ? undefined : read(0, "utf8"));

/** A command's work, handed the arguments after its name; returns the exit code. */
type Command = (argv: readonly string[]) => number | Promise<number>;

export interface CommandEntry {
  /** One line for `--help`. */
  summary: string;
  /** Loaded on demand, so a command only pays for its own imports. */
  load: () => Promise<Command>;
}

export interface Io {
  out: (line: string) => void;
  err: (line: string) => void;
}

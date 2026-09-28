/** A `git` invocation, split into the parts the guards read. */
export interface GitCall {
  /** `NAME=value` assignments written before `git`. */
  env: string[];
  /** Values of `-c key=value` given before the subcommand. */
  config: string[];
  /** The subcommand, `commit`, `push`, …; empty when there is none. */
  subcommand: string;
  /** Everything after the subcommand. */
  args: string[];
}

/** A `gh` invocation: its command words (`pr`, `create`) and the rest. */
export interface GhCall {
  command: string[];
  args: string[];
}

/** Runs a program with arguments and returns its trimmed stdout; throws when it exits non-zero. */
export type Tool = (command: string, args: readonly string[]) => string;

/** A GitHub repository, `owner/name`. */
export interface Repository {
  owner: string;
  name: string;
}

/** One text substitution `init` applies to every tracked file, in order. */
export type Rename = readonly [from: string, to: string];

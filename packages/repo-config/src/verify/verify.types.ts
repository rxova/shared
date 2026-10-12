/**
 * Runs one step, in `env` when given (else the current environment). Injected
 * so the sequencing can be tested without running it.
 */
export type Runner = (command: string, env?: NodeJS.ProcessEnv) => void;

/**
 * Runs `command --dry=json` and returns what it printed: turbo's plan of the
 * run, with each task's cache status. Injected so planning runs nothing.
 */
export type DryRun = (command: string) => string;

/** One job of `verify --plan`'s fan-out: a matrix entry. */
export interface Leg {
  /** The job's name. */
  name: string;
  /** The steps it runs, for `verify --only`. */
  only: string;
  /** The packages its split step runs, for `verify --filter`; empty for every package. */
  filter: string;
}

/** A package a split step's tasks run in, as turbo's dry run reports it. */
export interface PlannedPackage {
  name: string;
  /** Its tasks' input file count: a rough cost. */
  weight: number;
  /** Whether every one of its tasks would replay from the cache. */
  hit: boolean;
}

/**
 * Runs one step, in `env` when given (else the current environment). Injected
 * so the sequencing can be tested without running it.
 */
export type Runner = (command: string, env?: NodeJS.ProcessEnv) => void;

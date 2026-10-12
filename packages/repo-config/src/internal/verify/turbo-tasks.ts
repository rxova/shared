/**
 * The tasks `command` hands to `turbo run`: the words after `run` up to the
 * first flag or shell operator. Empty when the command runs no turbo task,
 * which is how a `split` on anything else is caught.
 */
export const turboTasks = (command: string): string[] =>
  /\bturbo\s+run\s+((?:[^\s&|;<>()-][^\s&|;<>()]*\s*)+)/.exec(command)?.[1]?.trim().split(/\s+/) ??
  [];

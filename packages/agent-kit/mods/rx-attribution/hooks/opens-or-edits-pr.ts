/** Whether a shell command runs gh pr create or gh pr edit. */
export const opensOrEditsPr = (command: string): boolean =>
  /\bgh\s+pr\s+(create|edit)\b/.test(command);

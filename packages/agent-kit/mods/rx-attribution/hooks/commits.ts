/** Whether a shell command runs git commit. */
export const commits = (command: string): boolean =>
  /\bgit\s+(?:-[cC]\s+\S+\s+)*commit\b/.test(command);

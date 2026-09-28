/** Whether a hook command runs this kit's installed runner. */
export const isOwnHook = (command: unknown): boolean =>
  typeof command === "string" && /[\\/]rx-ai[\\/]hooks\.js"?(\s|$)/.test(command);

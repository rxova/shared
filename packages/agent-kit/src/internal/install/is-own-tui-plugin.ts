/** Whether an OpenCode `plugins` entry points at this kit's installed status line. */
export const isOwnTuiPlugin = (value: unknown): boolean =>
  typeof value === "string" && /[\\/]plugin[\\/]rx-statusline[\\/]?$/.test(value);

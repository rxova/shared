import { join } from "node:path";

/** `$XDG_CONFIG_HOME`, or `~/.config` when it is unset or empty, as the XDG spec says. */
export const xdgConfigHome = (value: string | undefined, home: string): string =>
  value === undefined || value === "" ? join(home, ".config") : value;

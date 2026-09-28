/** A path with a leading `~` or `$HOME` replaced by the home directory. */
export const expandHome = (path: string, home: string): string =>
  path.replace(/^(~|\$HOME|\$\{HOME\})(?=\/|$)/, home);

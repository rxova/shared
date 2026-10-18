import { isOwnTuiPlugin } from "@/internal/install/is-own-tui-plugin";

/**
 * An OpenCode `cli.json` whose `plugins` loads the kit's status line from `dir`, or, when `dir`
 * is undefined, without it. OpenCode takes a directory URL rather than a file, so `dir` is the
 * plugin's folder. Everyone else's entries keep their place and their order.
 */
export const withOwnTuiPlugin = (
  cli: Record<string, unknown>,
  dir: string | undefined,
): Record<string, unknown> => {
  const existing = Array.isArray(cli.plugins) ? (cli.plugins as unknown[]) : [];
  const others = existing.filter((entry) => !isOwnTuiPlugin(entry));
  const plugins = dir === undefined ? others : [...others, `file://${dir}`];
  if (plugins.length > 0) return { ...cli, plugins };
  // Nothing left to load: drop the key rather than leave an empty list behind.
  const rest = { ...cli };
  delete rest.plugins;
  return rest;
};

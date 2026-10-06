import type { Tool } from "@/init/init.types";

const OPENERS: Partial<Record<NodeJS.Platform, readonly [string, ...string[]]>> = {
  darwin: ["open"],
  linux: ["xdg-open"],
  win32: ["cmd", "/c", "start", ""],
};

/**
 * Opens `url` in the default browser, but only for a person at a terminal:
 * never when stdout is not a TTY or `CI` is set. Returns whether it opened;
 * an unknown platform or a failing opener is not an error.
 */
export const openInBrowser = (
  run: Tool,
  url: string,
  {
    platform,
    isTTY,
    env,
  }: { platform: NodeJS.Platform; isTTY: boolean; env: Record<string, string | undefined> },
): boolean => {
  const opener = OPENERS[platform];
  if (!isTTY || env.CI || opener === undefined) return false;
  const [command, ...args] = opener;
  try {
    run(command, [...args, url]);
    return true;
  } catch {
    return false;
  }
};

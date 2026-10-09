/** The directory a shell command runs git in, from `git -C <dir>` or a leading `cd <dir> &&`. */
export const gitDir = (command: string): string | undefined => {
  const word =
    /\bgit\s+-C\s+("[^"]+"|'[^']+'|\S+)/.exec(command)?.[1] ??
    /^\s*cd\s+("[^"]+"|'[^']+'|\S+)\s*&&/.exec(command)?.[1];

  return word?.replace(/^["']|["']$/g, "");
};

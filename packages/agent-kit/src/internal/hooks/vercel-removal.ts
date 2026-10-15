// vercel's global options that take the next word as their value.
const VALUE_OPTIONS = new Set([
  "--scope",
  "-S",
  "--token",
  "-t",
  "--team",
  "-T",
  "--cwd",
  "--local-config",
  "-A",
  "--global-config",
  "-Q",
]);
const REMOVE = new Set(["rm", "remove"]);

/**
 * What a `vercel` call removes, judged by its subcommands rather than any `rm` in the words:
 * `vercel rm <deployment>` and `vercel project rm <name>` count, `vercel env rm` and the other
 * resource subcommands do not.
 */
export const vercelRemoval = (args: readonly string[]): string | undefined => {
  const commands: string[] = [];
  let isValue = false;
  for (const arg of args) {
    if (isValue) isValue = false;
    else if (VALUE_OPTIONS.has(arg)) isValue = true;
    else if (!arg.startsWith("-")) commands.push(arg);
  }
  const [command = "", subcommand = ""] = commands;
  if (REMOVE.has(command)) return "removes a Vercel deployment";
  if ((command === "project" || command === "projects") && REMOVE.has(subcommand))
    return "removes a Vercel project";
  return undefined;
};

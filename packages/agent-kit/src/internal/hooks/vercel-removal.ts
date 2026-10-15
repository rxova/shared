/**
 * What a `vercel` call removes, judged by its subcommands rather than any `rm` in the words:
 * `vercel rm <deployment>` and `vercel project rm <name>` count, `vercel env rm` and the other
 * resource subcommands do not.
 */
export const vercelRemoval = (args: readonly string[]): string | undefined => {
  // vercel's global options that take the next word as their value.
  const valueOptions = new Set([
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
  const remove = new Set(["rm", "remove"]);
  const commands: string[] = [];
  let isValue = false;
  for (const arg of args) {
    if (isValue) isValue = false;
    else if (valueOptions.has(arg)) isValue = true;
    else if (!arg.startsWith("-")) commands.push(arg);
  }
  const [command = "", subcommand = ""] = commands;
  if (remove.has(command)) return "removes a Vercel deployment";
  if ((command === "project" || command === "projects") && remove.has(subcommand))
    return "removes a Vercel project";
  return undefined;
};

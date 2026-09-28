import type { Guard } from "@/hooks/hook.types";
import { allow } from "@/internal/hooks/allow";
import { bashCommand } from "@/internal/hooks/bash-command";
import { destructiveCommand } from "@/internal/hooks/destructive-command";
import { discardsWork } from "@/internal/hooks/discards-work";
import { forcePushTarget } from "@/internal/hooks/force-push-target";
import { gitOutput } from "@/internal/hooks/git-output";
import { recursiveRemoval } from "@/internal/hooks/recursive-removal";
import { gitCall } from "@/internal/shell/git-call";
import { shellSegments } from "@/internal/shell/shell-segments";

/**
 * Stops commands that destroy something hard to get back: a recursive `rm` outside the project,
 * a force push to a protected branch, discarding uncommitted work, dropping data, and tearing
 * down cloud resources. The agent is told to ask the user, who can run it themselves.
 */
export const dangerZone: Guard = (input, context) => {
  const command = bashCommand(input);
  if (command === undefined) return allow;
  const cwd = input.cwd ?? context.env.PWD ?? "/";
  const home = context.env.HOME ?? "/nonexistent-home";
  const ask = "If it is really wanted, ask the user to run it themselves.";

  for (const words of shellSegments(command)) {
    const target = recursiveRemoval(words, cwd, home);
    if (target !== undefined)
      return { block: true, reason: `rm -r on ${target} reaches outside this project. ${ask}` };

    const destroys = destructiveCommand(words);
    if (destroys !== undefined) return { block: true, reason: `This command ${destroys}. ${ask}` };

    const call = gitCall(words);
    if (call === undefined) continue;
    const branch = forcePushTarget(call, () =>
      gitOutput(context, cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
    );
    if (branch !== undefined)
      return {
        block: true,
        reason: `A force push would rewrite ${branch}. Push a branch and open a pull request instead.`,
      };
    if (discardsWork(call) && (gitOutput(context, cwd, ["status", "--porcelain"]) ?? "") !== "")
      return {
        block: true,
        reason: `git ${call.subcommand} would throw away uncommitted changes. Commit or stash them first. ${ask}`,
      };
  }
  return allow;
};

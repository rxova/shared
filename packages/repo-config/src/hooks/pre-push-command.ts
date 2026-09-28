import { pushesCode } from "@/internal/hooks/pushes-code";
import { readStdin } from "@/internal/hooks/read-stdin";
import { verifyCommand } from "@/verify/verify-command";

/**
 * `rxova-repo-config pre-push`: the whole `.husky/pre-push` hook. A push that
 * only deletes refs verifies nothing — GUI clients run the hook on every
 * delete — and any other push runs `verify` in this process, with the
 * arguments after the command (`--only a,b`). Run by hand, with no git input
 * on a terminal, it verifies. Returns the process exit code.
 */
export const prePushCommand = (
  argv: readonly string[] = [],
  {
    input = readStdin,
    verify = verifyCommand,
  }: { input?: () => string | undefined; verify?: (argv: readonly string[]) => number } = {},
): number => {
  const lines = input();
  if (lines !== undefined && !pushesCode(lines)) {
    console.log("pre-push: nothing but deletions to push, nothing to verify");
    return 0;
  }
  return verify(argv);
};

import type { GitCall } from "@/internal/shell/shell.types";
import { PROTECTED } from "@/internal/hooks/protected-branches";

/**
 * For a force push (`--force`, `-f`, `--force-with-lease`, or a `+ref`), the protected branch it
 * would rewrite. With no refspec the current branch is what gets pushed, so it is asked for.
 */
export const forcePushTarget = (
  call: GitCall,
  currentBranch: () => string | undefined,
): string | undefined => {
  if (call.subcommand !== "push") return undefined;
  const forced = call.args.some(
    (arg) =>
      arg === "--force" ||
      arg.startsWith("--force-with-lease") ||
      /^-[^-]*f/.test(arg) ||
      arg.startsWith("+"),
  );
  if (!forced) return undefined;
  const positional = call.args.filter((arg) => !arg.startsWith("-"));
  const refs = positional.slice(1).map((ref) => ref.replace(/^\+/, "").replace(/^.*:/, ""));
  const targets = refs.length > 0 ? refs : [currentBranch() ?? ""];
  return targets.find((ref) => PROTECTED.test(ref.replace(/^refs\/heads\//, "")));
};

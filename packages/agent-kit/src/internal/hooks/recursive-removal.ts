import { resolve } from "node:path";
import { expandHome } from "@/internal/hooks/expand-home";
import { isWithin } from "@/internal/hooks/is-within";
import { programName } from "@/internal/shell/program-name";
import { unwrapRunner } from "@/internal/shell/unwrap-runner";

/**
 * When the words are an `rm -r` that reaches outside the project (or removes the project itself,
 * or aims at an unexpanded variable that could be empty), the offending target; otherwise
 * undefined. `sudo` in front is looked through.
 */
export const recursiveRemoval = (
  words: readonly string[],
  cwd: string,
  home: string,
): string | undefined => {
  const [first = "", ...args] = unwrapRunner(words);
  if (programName(first) !== "rm") return undefined;
  const options = args.filter((arg) => arg.startsWith("-") && arg !== "-");
  const recursive = options.some((arg) => arg === "--recursive" || /^-[^-]*[rR]/.test(arg));
  if (!recursive) return undefined;
  return args
    .filter((arg) => !arg.startsWith("-"))
    .find(
      (target) => target.startsWith("$") || !isWithin(cwd, resolve(cwd, expandHome(target, home))),
    );
};

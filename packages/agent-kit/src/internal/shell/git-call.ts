import type { GitCall } from "@/internal/shell/shell.types";
import { leadingAssignments } from "@/internal/shell/leading-assignments";
import { programName } from "@/internal/shell/program-name";
import { GIT_VALUE_OPTIONS } from "@/internal/shell/git-value-options";

/** The words as a `git` call, or undefined when they run something else. */
export const gitCall = (words: readonly string[]): GitCall | undefined => {
  const start = leadingAssignments(words);
  if (programName(words[start] ?? "") !== "git") return undefined;

  const rest = words.slice(start + 1);
  const config: string[] = [];
  let subcommand = rest.length;
  let isValue = false;
  for (const [index, word] of rest.entries()) {
    if (isValue) {
      isValue = false;
      continue;
    }
    if (!word.startsWith("-")) {
      subcommand = index;
      break;
    }
    if (word === "-c") config.push(rest[index + 1] ?? "");
    else if (word.startsWith("-c") && word.length > 2) config.push(word.slice(2));
    isValue = GIT_VALUE_OPTIONS.has(word);
  }
  return {
    env: words.slice(0, start),
    config,
    subcommand: rest[subcommand] ?? "",
    args: rest.slice(subcommand + 1),
  };
};

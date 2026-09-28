import type { GhCall } from "@/internal/shell/shell.types";
import { leadingAssignments } from "@/internal/shell/leading-assignments";
import { programName } from "@/internal/shell/program-name";

/** The words as a `gh` call (`gh pr create …` → command `pr create`), or undefined. */
export const ghCall = (words: readonly string[]): GhCall | undefined => {
  const start = leadingAssignments(words);
  if (programName(words[start] ?? "") !== "gh") return undefined;
  const rest = words.slice(start + 1);
  const firstOption = rest.findIndex((word) => word.startsWith("-"));
  const split = firstOption === -1 ? rest.length : firstOption;
  return { command: rest.slice(0, split), args: rest.slice(split) };
};

import { leadingAssignments } from "@/internal/shell/leading-assignments";
import { programName } from "@/internal/shell/program-name";

/**
 * The words with their launcher taken off, so the program that really runs comes first:
 * `NAME=value` assignments, `sudo`, and package runners (`npx`, `bunx`, `pnpx`, `pnpm dlx|exec`,
 * `yarn dlx|exec`), repeatedly.
 */
export const unwrapRunner = (words: readonly string[]): string[] => {
  let rest = words.slice(leadingAssignments(words));
  for (;;) {
    const program = programName(rest[0] ?? "");
    if (program === "sudo" || program === "npx" || program === "bunx" || program === "pnpx")
      rest = rest.slice(1);
    else if (
      (program === "pnpm" || program === "yarn") &&
      (rest[1] === "dlx" || rest[1] === "exec")
    )
      rest = rest.slice(2);
    else return rest;
    while (rest[0]?.startsWith("-") === true) rest = rest.slice(1);
  }
};

import { changesetProblems } from "@/internal/changeset/changeset-problems";
import { listChangesets } from "@/internal/changeset/list-changesets";
import { readFile } from "@/internal/config/read-file";
import type { Reader } from "@/config/config.types";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config lint-changesets`: every changeset waiting in `.changeset/`
 * is safe to release. A summary line `@changesets/changelog-github` reads as
 * metadata (`commit:`, `pr:`, `author:` at the start of a line, code fences
 * included) is rewritten or, for `commit:`, breaks the release job outright;
 * with `repoConfig.changeset.singlePackage`, each names exactly one package.
 * Needs no commit range, so it fits the `verify` gate. Returns the process
 * exit code.
 */
export const lintChangesetsCommand = ({
  root = process.cwd(),
  read = readFile,
  list = listChangesets,
}: { root?: string; read?: Reader; list?: (root: string) => string[] } = {}): number => {
  try {
    const files = list(root);
    const problems = changesetProblems(root, files, read, {
      singlePackage: readConfig(root, read).changeset?.singlePackage === true,
    });
    if (problems.length > 0) {
      console.error(
        [
          "lint-changesets: these changesets would break the changelog.",
          ...problems,
          "Keep `commit:`, `pr:` and `author:` off the start of a summary line; in a code fence, start the line with something else.",
        ].join("\n"),
      );
      return 1;
    }
    console.log(`lint-changesets: ${String(files.length)} changeset(s) ok`);
    return 0;
  } catch (failure) {
    console.error(`lint-changesets failed — ${(failure as Error).message}`);
    return 1;
  }
};

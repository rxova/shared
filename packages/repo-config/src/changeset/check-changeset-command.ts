import { changesetFiles } from "@/internal/changeset/changeset-files";
import { changesetProblems } from "@/internal/changeset/changeset-problems";
import { gitDiff } from "@/internal/changeset/git-diff";
import { liveLabels } from "@/internal/changeset/live-labels";
import { shippedChanges } from "@/internal/changeset/shipped-changes";
import { versionedDirs } from "@/internal/changeset/versioned-dirs";
import { readFile } from "@/internal/config/read-file";
import { runTool } from "@/internal/init/run-tool";
import type { Differ } from "@/changeset/changeset.types";
import type { Reader } from "@/config/config.types";
import type { Tool } from "@/init/init.types";
import { checkChangeset } from "@/changeset/check-changeset";
import { readConfig } from "@/config/read-config";

/**
 * `rxova-repo-config check-changeset`: a change to a published package needs a
 * changeset, or the release goes out with an empty changelog and an unchanged
 * version.
 *
 * Run from the repository root with `BASE_SHA` and `HEAD_SHA` set. `PR_LABELS`
 * (comma-separated) and `PR_TITLE` carry the escape hatch; with `PR_NUMBER`
 * set, the pull request's current labels are read with `gh` instead of
 * `PR_LABELS`, which stays the fallback. What counts as a
 * change is `repoConfig.changeset.scope`: `code` (the default) leaves a
 * package's markdown and tests out, `shipped` counts everything its tarball
 * ships, README and `llms.txt` included. The changesets the range adds are
 * then linted: no summary line the changelog would read as metadata and, with
 * `repoConfig.changeset.singlePackage`, exactly one package each, so every
 * changelog entry belongs to the package it describes. With
 * `repoConfig.changeset.includePrivate` a private package counts as one that
 * needs a changeset too. Returns the process exit code.
 */
export const checkChangesetCommand = (
  env: NodeJS.ProcessEnv = process.env,
  {
    root = process.cwd(),
    diff = gitDiff,
    read = readFile,
    tool = runTool,
    published,
  }: { root?: string; diff?: Differ; read?: Reader; tool?: Tool; published?: string[] } = {},
): number => {
  const base = env.BASE_SHA;
  const head = env.HEAD_SHA;

  if (!base || !head) {
    console.error("check-changeset: BASE_SHA and HEAD_SHA must be set");
    return 1;
  }

  try {
    const config = readConfig(root, read).changeset ?? {};
    const changed = diff(base, head);
    const present = diff(base, head, { existing: true });
    const dirs = published ?? versionedDirs(root, config.includePrivate === true);
    const verdict = checkChangeset(
      changed,
      dirs,
      { labels: liveLabels(env, tool), title: env.PR_TITLE ?? "" },
      config.scope === "shipped"
        ? { present, shipped: shippedChanges(changed, dirs, root, read) }
        : { present },
    );

    if (verdict.exitCode === 0) {
      const problems = changesetProblems(root, changesetFiles(present), read, {
        singlePackage: config.singlePackage === true,
      });
      if (problems.length > 0) {
        console.error(
          ["check-changeset: fix these changesets before merging.", ...problems].join("\n"),
        );
        return 1;
      }
    }

    if (verdict.exitCode === 0) console.log(verdict.message);
    else console.error(verdict.message);
    return verdict.exitCode;
  } catch (failure) {
    console.error(`check-changeset failed — ${(failure as Error).message}`);
    return 1;
  }
};

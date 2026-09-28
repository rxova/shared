import { changesetFiles } from '@/internal/changeset/changeset-files';
import { gitDiff } from '@/internal/changeset/git-diff';
import { labelsOf } from '@/internal/changeset/labels-of';
import { readFile } from '@/internal/config/read-file';
import { singlePackageProblems } from '@/internal/changeset/single-package-problems';
import type { Differ } from '@/changeset/changeset.types';
import type { Reader } from '@/config/config.types';
import { join } from 'node:path';
import { checkChangeset } from '@/changeset/check-changeset';
import { publishedDirs } from '@/changeset/published-dirs';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config check-changeset`: a change to a published package needs a
 * changeset, or the release goes out with an empty changelog and an unchanged
 * version.
 *
 * Run from the repository root with `BASE_SHA` and `HEAD_SHA` set. `PR_LABELS`
 * (comma-separated) and `PR_TITLE` carry the escape hatch. With
 * `repoConfig.changeset.singlePackage` set in the root `package.json`, each
 * changeset must also name exactly one package, so every changelog entry
 * belongs to the package it describes. Returns the process exit code.
 */
export const checkChangesetCommand = (
  env: NodeJS.ProcessEnv = process.env,
  {
    root = process.cwd(),
    diff = gitDiff,
    read = readFile,
    published,
  }: { root?: string; diff?: Differ; read?: Reader; published?: string[] } = {},
): number => {
  const base = env.BASE_SHA;
  const head = env.HEAD_SHA;

  if (!base || !head) {
    console.error('check-changeset: BASE_SHA and HEAD_SHA must be set');
    return 1;
  }

  try {
    const config = readConfig(root, read);
    const present = diff(base, head, { existing: true });
    const verdict = checkChangeset(
      diff(base, head),
      published ?? publishedDirs(root),
      { labels: labelsOf(env.PR_LABELS), title: env.PR_TITLE ?? '' },
      { present },
    );

    if (verdict.exitCode === 0 && config.changeset?.singlePackage === true) {
      const problems = singlePackageProblems(
        changesetFiles(present).map((file) => join(root, file)),
        read,
      );
      if (problems.length > 0) {
        console.error(
          ['check-changeset: each changeset must name exactly one package.', ...problems].join(
            '\n',
          ),
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

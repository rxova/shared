import { gitReader } from '@/internal/scope/git-reader';
import { versionBumpOnly } from '@/internal/scope/version-bump-only';
import type { Git, Scope } from '@/scope/scope.types';
import { isReleaseMetadata } from '@/scope/is-release-metadata';

/**
 * Whether a commit range changed anything a test could fail on.
 *
 * One kind of commit reaches CI without moving the tree in any meaningful way:
 * the release commit. `changeset version` bumps a version field, writes a
 * changelog and consumes the changeset files. The source tree is otherwise
 * byte-identical to a parent CI already proved green, so re-running the whole
 * matrix re-derives a verdict that commit already carries.
 *
 * The release commit is recognised by its file set, never by its branch name or
 * its subject line, both of which anyone can write. A `package.json` counts only
 * when the edited lines are its version and nothing else. Every uncertain case
 * resolves to running everything: skipping is the dangerous answer.
 */
export const decideScope = (
  base: string | undefined,
  head: string | undefined,
  run: Git = gitReader,
): Scope => {
  // An initial push reports an all-zero `before`, and a force-push can report a
  // commit that is no longer reachable. Neither is a licence to skip.
  if (!base || !head || /^0+$/.test(base)) {
    return { codeChanged: true, reason: 'no usable commit range' };
  }

  let changed: string[];
  try {
    changed = run.names(base, head);
  } catch {
    return { codeChanged: true, reason: 'could not diff the range' };
  }

  if (changed.length === 0) return { codeChanged: true, reason: 'empty diff' };

  const releaseOnly = changed.every((file) => {
    if (isReleaseMetadata(file)) return true;
    if (file === 'package.json' || file.endsWith('/package.json')) {
      return versionBumpOnly(file, { base, head }, run);
    }
    return false;
  });

  return releaseOnly
    ? {
        codeChanged: false,
        reason: `release commit — ${String(changed.length)} file(s), version and changelog only`,
      }
    : { codeChanged: true, reason: `${String(changed.length)} file(s) changed` };
};

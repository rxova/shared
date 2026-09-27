import { execFileSync } from 'node:child_process';
import type { Differ } from '../../tooling/src/changeset.types.ts';
import { revisionRange } from './revision-range.ts';

/** The paths a commit range touched; with `existing`, only those still present at the head. */
export const gitDiff: Differ = (base, head, { existing = false } = {}) =>
  execFileSync(
    'git',
    ['diff', '--name-only', ...(existing ? ['--diff-filter=d'] : []), revisionRange(base, head)],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter(Boolean);

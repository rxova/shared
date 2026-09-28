import { execFileSync } from 'node:child_process';
import { revisionRange } from '@/internal/scope/revision-range';

/** The paths a commit range touched, both sides of a rename. */
export const gitDiffNames = (base: string, head: string): string[] =>
  execFileSync('git', ['diff', '--name-only', '--no-renames', revisionRange(base, head)], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
    .split('\n')
    .filter(Boolean);

import { execFileSync } from 'node:child_process';
import { revisionRange } from './revision-range.ts';

/** One file's diff across a commit range, without context lines. The path sits behind `--`. */
export const gitDiffPatch = (base: string, head: string, file: string): string =>
  execFileSync('git', ['diff', '--unified=0', revisionRange(base, head), '--', file], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });

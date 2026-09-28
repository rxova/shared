import { execFileSync } from 'node:child_process';

/** The files git tracks under `root`, as paths relative to it. */
export const gitLsFiles = (root: string): string[] =>
  execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean);

import { execFileSync } from 'node:child_process';
import type { Git } from '../../tooling/src/scope.types.ts';

/** Runs git in the working directory and returns its stdout. */
export const git: Git = (...args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });

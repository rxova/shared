import { gitDiffNames } from './git-diff-names.ts';
import { gitDiffPatch } from './git-diff-patch.ts';
import type { Git } from '../../tooling/src/scope.types.ts';

/** The two questions check-scope asks a repository, answered by the real git. */
export const gitReader: Git = { names: gitDiffNames, patch: gitDiffPatch };

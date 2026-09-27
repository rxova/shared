import { gitDiffNames } from '@rxova-helpers/scope/git-diff-names';
import { gitDiffPatch } from '@rxova-helpers/scope/git-diff-patch';
import type { Git } from '@rxova-tooling/scope/scope.types';

/** The two questions check-scope asks a repository, answered by the real git. */
export const gitReader: Git = { names: gitDiffNames, patch: gitDiffPatch };

import { gitDiffDeleted } from "@/internal/scope/git-diff-deleted";
import { gitDiffNames } from "@/internal/scope/git-diff-names";
import { gitDiffPatch } from "@/internal/scope/git-diff-patch";
import type { Git } from "@/scope/scope.types";

/** The questions check-scope asks a repository, answered by the real git. */
export const gitReader: Git = { names: gitDiffNames, patch: gitDiffPatch, deleted: gitDiffDeleted };

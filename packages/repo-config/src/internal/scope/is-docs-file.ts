import { matchesAny } from "@/internal/files/matches-any";
import type { ScopeRules } from "@/scope/scope.types";

/** Whether a path is documentation under the rules: `ignore` matches it and `keep` does not. */
export const isDocsFile = (file: string, rules: Pick<ScopeRules, "ignore" | "keep">): boolean =>
  matchesAny(file, rules.ignore) && !matchesAny(file, rules.keep);

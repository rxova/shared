import { DEFAULT_SCOPE_RULES } from "@/internal/scope/default-scope-rules";
import { deletedPaths } from "@/internal/scope/deleted-paths";
import { gitReader } from "@/internal/scope/git-reader";
import { isDocsFile } from "@/internal/scope/is-docs-file";
import { versionBumpOnly } from "@/internal/scope/version-bump-only";
import { matchesAny } from "@/internal/files/matches-any";
import type { Git, Scope, ScopeRules } from "@/scope/scope.types";
import { isReleaseMetadata } from "@/scope/is-release-metadata";

/**
 * Whether a commit range changed anything a test could fail on.
 *
 * Two kinds of range reach CI without moving the code. The release commit:
 * `changeset version` bumps a version field, writes a changelog and consumes
 * the changeset files, leaving the source tree byte-identical to a parent CI
 * already proved green. And a documentation change: Markdown no build, test or
 * package check reads. Re-running the whole matrix for either re-derives a
 * verdict the tree already carries.
 *
 * Both are recognised by their file set, never by a branch name or a subject
 * line, both of which anyone can write. A `package.json` counts only when the
 * edited lines are its version and nothing else. Documentation is what
 * `rules.ignore` matches and `rules.keep` does not (`repoConfig.scope`, with
 * defaults in `DEFAULT_SCOPE_RULES`), and a deleted file is never documentation:
 * a check may expect it. `docsChanged` reports a touch to `rules.site`, so the
 * docs site's own build can run on a range that skips everything else. Every
 * uncertain case resolves to running everything: skipping is the dangerous answer.
 */
export const decideScope = (
  base: string | undefined,
  head: string | undefined,
  run: Git = gitReader,
  rules: Partial<ScopeRules> = {},
): Scope => {
  const everything = (reason: string): Scope => ({
    codeChanged: true,
    docsOnly: false,
    docsChanged: true,
    reason,
  });
  // An initial push reports an all-zero `before`, and a force-push can report a
  // commit that is no longer reachable. Neither is a licence to skip.
  if (!base || !head || /^0+$/.test(base)) return everything("no usable commit range");

  let changed: string[];
  try {
    changed = run.names(base, head);
  } catch {
    return everything("could not diff the range");
  }

  if (changed.length === 0) return everything("empty diff");

  const { ignore, keep, site } = { ...DEFAULT_SCOPE_RULES, ...rules };
  const docsChanged = changed.some((file) => matchesAny(file, site));
  const release = changed.filter(
    (file) =>
      isReleaseMetadata(file) ||
      ((file === "package.json" || file.endsWith("/package.json")) &&
        versionBumpOnly(file, { base, head }, run)),
  );
  const rest = changed.filter((file) => !release.includes(file));
  const counted = `${String(changed.length)} file(s)`;

  if (rest.length === 0) {
    return {
      codeChanged: false,
      docsOnly: false,
      docsChanged,
      reason: `release commit — ${counted}, version and changelog only`,
    };
  }

  const deleted = rest.every((file) => isDocsFile(file, { ignore, keep }))
    ? deletedPaths({ base, head }, run)
    : undefined;
  const docsOnly = deleted !== undefined && rest.every((file) => !deleted.has(file));

  return docsOnly
    ? { codeChanged: false, docsOnly, docsChanged, reason: `documentation only — ${counted}` }
    : { codeChanged: true, docsOnly, docsChanged, reason: `${counted} changed` };
};

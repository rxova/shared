import { mergeWorkspace } from "@/internal/knip/merge-workspace";
import type { BaseKnipOptions, KnipConfigObject, KnipWorkspace } from "@/knip/knip.types";

/**
 * Unused files, exports and dependencies as a gate rather than a report:
 * config hints are errors, because advice nobody has to act on stops being
 * read. Entry points are inferred from each manifest; what a repository passes
 * here is only what inference cannot know.
 */
export const baseKnipConfig = ({
  docsApp = "apps/docs",
  ignoreDependencies = [],
  ignoreBinaries = [],
  ignore = [],
  workspaces = {},
}: BaseKnipOptions = {}): KnipConfigObject => {
  const defaults: Record<string, KnipWorkspace> =
    docsApp === false ? {} : { [docsApp]: { ignoreDependencies: ["@rxova/brand"] } };
  const merged = { ...defaults };
  for (const [dir, workspace] of Object.entries(workspaces)) {
    merged[dir] = mergeWorkspace(defaults[dir] ?? {}, workspace);
  }
  return {
    treatConfigHintsAsErrors: true,
    ...(ignoreDependencies.length === 0 ? {} : { ignoreDependencies: [...ignoreDependencies] }),
    ...(ignoreBinaries.length === 0 ? {} : { ignoreBinaries: [...ignoreBinaries] }),
    ...(ignore.length === 0 ? {} : { ignore: [...ignore] }),
    ...(Object.keys(merged).length === 0 ? {} : { workspaces: merged }),
  };
};

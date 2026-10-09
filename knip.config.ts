import { baseKnipConfig } from "@rxova/repo-config/knip";

/**
 * Unused files, exports and dependencies, as a gate rather than a report, from
 * the package's own preset.
 *
 * The `export` keyword is the point: an export nothing imports still has to be
 * kept working, still shows up in completions, and still reads as part of the
 * contract. Nothing else in this repository notices one.
 *
 * Entry points are inferred from each package's manifest: the exports, and the
 * bin every command is reached from. Nothing needs listing by hand.
 */
export default baseKnipConfig({
  // This docs site does not depend on `@rxova/brand`, so the preset's default for it would be an unused ignore.
  docsApp: false,
  // `rxova-repo-config check-exports` runs `attw` from a shell command, where knip cannot see it.
  ignoreDependencies: ["@arethetypeswrong/cli"],
  // Claude Code mods: Claude Code loads them from `hooks/hooks.json`, outside any package entry.
  ignore: ["packages/agent-kit/mods/**"],
  // Scripts the composite actions run with `node`: an action.yml is their only caller.
  workspaces: {
    ".": { entry: ["actions/*/*.{js,cjs,mjs}"] },
  },
});

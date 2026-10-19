/** Where the hook runner goes, relative to the target. */
export const RUNNER = "rx-ai/hooks.js";

/** Where the manifest goes, relative to the target. */
export const MANIFEST = "rx-ai/manifest.json";

/** Where the OpenCode plugin goes, relative to an OpenCode target. */
export const PLUGIN = "plugins/rx-kit.js";

/** Where the status line script goes, relative to a Claude Code target. */
export const STATUSLINE = "rx-ai/statusline.js";

/** Where the OpenCode status line's TUI entry goes, relative to an OpenCode target. */
export const TUI_PLUGIN = "plugin/rx-statusline/index.js";

/** Where its server entry goes: the host loads a plugin in both runtimes. */
export const TUI_SERVER = "plugin/rx-statusline/server.js";

/** Where its manifest goes, which is what makes the host install and resolve its imports. */
export const TUI_MANIFEST = "plugin/rx-statusline/package.json";

/** Where the status line's row builder goes, relative to an OpenCode target. */
export const ROWS = "rx-ai/statusline-rows.js";

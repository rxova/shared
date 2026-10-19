/**
 * What the status line plugin installs to render with.
 *
 * Pinned to a line rather than left open: OpenCode bundles its own `@opentui/core`, and two
 * copies in one process both register the `OPENTUI_FORCE_UNICODE` environment variable, which is
 * fatal on import. A `>=` range resolves to the newest major and brings exactly that collision,
 * so this tracks the line the host ships. Raise it when OpenCode does.
 */
export const OPENTUI_DEPS = {
  "@opentui/core": "~0.5.17",
  "@opentui/solid": "~0.5.17",
  "solid-js": "^1.9.0",
} as const;

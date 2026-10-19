import { OPENTUI_DEPS } from "@/internal/install/opentui-deps";

/**
 * The `package.json` beside the status line plugin. OpenCode installs a plugin directory's
 * dependencies, so this is what makes the rendering modules resolve at all — without it the
 * imports fail and the plugin never loads.
 *
 * The entries are split because the host loads a plugin twice, once per runtime: `.` must be
 * server-safe, and only `./tui` may touch `context.ui` or `context.data`. A single entry holding
 * the TUI code fails the server load every time.
 */
export const opencodeStatuslineManifest = (): string =>
  `${JSON.stringify(
    {
      name: "rx-statusline",
      version: "0.0.0",
      private: true,
      type: "module",
      exports: { ".": "./server.js", "./tui": "./index.js" },
      dependencies: { ...OPENTUI_DEPS },
    },
    null,
    2,
  )}\n`;

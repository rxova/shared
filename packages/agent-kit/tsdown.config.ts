import { defineConfig } from "tsdown";
import { baseBuildConfig } from "@rxova/repo-config/tsdown";

// The hook runner and both status lines are built on their own: the installer copies each file
// out of the package, so none may import a chunk it shares with the CLI. The OpenCode plugin
// imports the rows build by path, which is why that one is a file of its own too.
export default defineConfig([
  baseBuildConfig({ entry: { index: "src/index.ts", cli: "src/cli/cli.ts" } }),
  baseBuildConfig({ entry: { hooks: "src/hooks/hooks-entry.ts" }, dts: false, clean: false }),
  baseBuildConfig({
    entry: { statusline: "src/statusline/statusline-entry.ts" },
    dts: false,
    clean: false,
  }),
  baseBuildConfig({
    entry: { "statusline-rows": "src/statusline/opencode-entry.ts" },
    dts: false,
    clean: false,
  }),
]);

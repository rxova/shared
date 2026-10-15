import { defineConfig } from "tsdown";
import { baseBuildConfig } from "@rxova/repo-config/tsdown";

// The hook runner and the status line are built on their own: the installer copies each file out
// of the package, so neither may import a chunk it shares with the CLI.
export default defineConfig([
  baseBuildConfig({ entry: { index: "src/index.ts", cli: "src/cli/cli.ts" } }),
  baseBuildConfig({ entry: { hooks: "src/hooks/hooks-entry.ts" }, dts: false, clean: false }),
  baseBuildConfig({
    entry: { statusline: "src/statusline/statusline-entry.ts" },
    dts: false,
    clean: false,
  }),
]);

import { defineConfig } from "tsdown";
import { baseBuildConfig } from "@rxova/repo-config/tsdown";

// The hook runner is built on its own: the installer copies that one file out of the
// package, so it must not import a chunk it shares with the CLI.
export default defineConfig([
  baseBuildConfig({ entry: { index: "src/index.ts", cli: "src/cli/cli.ts" } }),
  baseBuildConfig({ entry: { hooks: "src/hooks/hooks-entry.ts" }, dts: false, clean: false }),
]);

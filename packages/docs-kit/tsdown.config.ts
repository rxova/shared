import { defineConfig } from "tsdown";
import { baseBuildConfig } from "@rxova/repo-config/tsdown";

// Runs where the docs build runs: Node, at an Astro build or in the bin after it.
export default defineConfig(
  baseBuildConfig({ entry: { index: "src/index.ts", cli: "src/cli/cli.ts" } }),
);

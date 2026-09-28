import { defineConfig } from "tsdown";
import { baseBuildConfig } from "./src/tsdown/base-build-config.ts";

// The presets are built from source here: this is the package that publishes them.
export default defineConfig(
  baseBuildConfig({
    entry: {
      index: "src/index.ts",
      cli: "src/cli/cli.ts",
      tsdown: "src/tsdown/base-build-config.ts",
      vitest: "src/vitest/base-vitest-config.ts",
    },
  }),
);

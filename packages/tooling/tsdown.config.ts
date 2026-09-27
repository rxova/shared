import { defineConfig } from 'tsdown';
import { baseBuildConfig } from './src/base-build-config.ts';

// The presets are built from source here: this is the package that publishes them.
export default defineConfig(
  baseBuildConfig({
    entry: {
      index: 'src/index.ts',
      cli: 'src/cli.ts',
      tsdown: 'src/base-build-config.ts',
      vitest: 'src/base-vitest-config.ts',
    },
  }),
);

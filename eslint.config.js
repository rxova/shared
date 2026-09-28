import { baseEslintConfig } from '@rxova/repo-config/eslint';

export default baseEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  // The scripts write to stdout: that is their output contract.
  consoleAllowed: ['packages/repo-config/**', 'packages/ai/src/internal/cli/console-io.ts'],
});

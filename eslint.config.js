import { baseEslintConfig } from '@rxova/tooling/eslint';

export default baseEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  // The scripts write to stdout: that is their output contract.
  consoleAllowed: ['packages/tooling/**', 'packages/ai/src/internal/cli/console-io.ts'],
});

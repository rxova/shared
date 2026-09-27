import { baseEslintConfig } from '@rxova/tooling/eslint';

export default baseEslintConfig({
  tsconfigRootDir: import.meta.dirname,
  // The scripts and their helpers write to stdout: that is their output contract.
  consoleAllowed: ['packages/tooling/**', 'packages/helpers/**'],
});

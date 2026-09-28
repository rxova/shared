import { describe, expect, it } from 'vitest';
import { isConfigFile } from '@/internal/hooks/is-config-file';

describe('isConfigFile', () => {
  it.each([
    '.eslintrc',
    '.eslintrc.cjs',
    'eslint.config.mts',
    '.prettierrc.yaml',
    'prettier.config.js',
    '.stylelintrc.json',
    'stylelint.config.mjs',
    'biome.jsonc',
    '.editorconfig',
    'tsconfig.json',
    'tsconfig.base.json',
    'jsconfig.json',
    '.commitlintrc.yml',
    'commitlint.config.ts',
    '.lintstagedrc',
    'lint-staged.config.js',
    '.markdownlint.jsonc',
    '.markdownlint-cli2.yaml',
    'jest.config.cjs',
    'ruff.toml',
    '.golangci.yml',
  ])('knows %s', (name) => {
    expect(isConfigFile(name)).toBe(true);
  });

  it.each(['package.json', 'eslint-rules.ts', 'tsconfig.ts', 'vite.config.ts', 'README.md'])(
    'passes %s',
    (name) => {
      expect(isConfigFile(name)).toBe(false);
    },
  );
});

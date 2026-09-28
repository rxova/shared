import { describe, expect, it } from 'vitest';
import { cssImportProblems } from '@/internal/pack-smoke/css-import-problems';

const manifest = {
  name: '@rxova/brand',
  exports: {
    '.': './src/index.ts',
    './tokens.css': './src/tokens.css',
    './theme.css': './src/theme.css',
    './fonts/*': './src/fonts/*.css',
    './gone.css': './src/gone.css',
  },
};
const files: Record<string, string> = {
  'src/tokens.css': ":root {}\n@import 'normalize.css';\n",
  'src/theme.css':
    "@import './tokens.css';\n@import url(\"../shared/base.css\");\n@import './missing.css';\n",
};
const read = (path: string) => {
  const text = files[path];
  if (text === undefined) throw new Error(`ENOENT ${path}`);
  return text;
};

describe('cssImportProblems', () => {
  it('reports the relative imports that do not resolve inside the tarball', () => {
    const contents = ['src/tokens.css', 'src/theme.css', 'shared/base.css'];
    expect(cssImportProblems(manifest, contents, read)).toEqual([
      "src/theme.css: @import './missing.css'",
    ]);
  });

  it('passes a package without stylesheets', () => {
    expect(cssImportProblems({ name: 'x', exports: './dist/index.js' }, [], read)).toEqual([]);
  });
});

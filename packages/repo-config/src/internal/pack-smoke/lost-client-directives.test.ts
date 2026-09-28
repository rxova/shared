import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lostClientDirectives } from '@/internal/pack-smoke/lost-client-directives';

const manifest = {
  exports: {
    '.': { import: './dist/index.js', require: './dist/index.cjs' },
    './client': {
      types: './dist/client.d.ts',
      import: './dist/client.js',
      require: './dist/client.cjs',
    },
    './server': './dist/server.js',
  },
};

const reader = (files: Record<string, string>) => (file: string) => {
  const text = files[file];
  if (text === undefined) throw new Error(`ENOENT: ${file}`);
  return text;
};

const check = (files: Record<string, string>) =>
  lostClientDirectives(manifest, { pkgDir: '/pkg', installedDir: '/inst', read: reader(files) });

describe('lostClientDirectives', () => {
  const sources = {
    [join('/pkg', 'src', 'index.ts')]: 'export * from "./client";',
    [join('/pkg', 'src', 'client.tsx')]: "'use client';\nexport const a = 1;",
  };

  it('passes when every client entry kept its directive, even after use strict', () => {
    expect(
      check({
        ...sources,
        [join('/inst', 'dist', 'client.js')]: '"use client";export const a=1;',
        [join('/inst', 'dist', 'client.cjs')]: '"use strict";"use client";exports.a=1;',
      }),
    ).toEqual([]);
  });

  it('names the built entries that lost it, or that are missing', () => {
    expect(
      check({ ...sources, [join('/inst', 'dist', 'client.js')]: 'export const a=1;' }),
    ).toEqual(['dist/client.js (from src/client.tsx)', 'dist/client.cjs (from src/client.tsx)']);
  });

  it('checks nothing when no source opens with the directive', () => {
    expect(check({ [join('/pkg', 'src', 'index.ts')]: 'export {};' })).toEqual([]);
  });
});

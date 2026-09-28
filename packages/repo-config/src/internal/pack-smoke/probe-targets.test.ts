import { describe, expect, it } from 'vitest';
import { probeTargets } from '@/internal/pack-smoke/probe-targets';

describe('probeTargets', () => {
  it('probes the package name for a root entry in any spelling', () => {
    expect(probeTargets({ name: 'a' })).toEqual(['a']);
    expect(probeTargets({ name: 'a', exports: './dist/index.js' })).toEqual(['a']);
    expect(probeTargets({ name: 'a', exports: { import: './a.js', require: './a.cjs' } })).toEqual([
      'a',
    ]);
    expect(probeTargets({ name: 'a', exports: { '.': './a.js', './b': './b.js' } })).toEqual(['a']);
  });

  it('probes the JavaScript subpaths of a subpath-only map', () => {
    expect(
      probeTargets({
        name: '@x/kit',
        exports: {
          './client': { types: './dist/client.d.ts', default: './dist/client.js' },
          './theme.css': './dist/theme.css',
          './icons/*': './dist/icons/*.js',
          './package.json': './package.json',
        },
      }),
    ).toEqual(['@x/kit/client']);
  });

  it('has nothing to probe for wildcard-only exports', () => {
    expect(
      probeTargets({ name: 'codemod', exports: { './transforms/*': './dist/transforms/*.cjs' } }),
    ).toEqual([]);
    expect(probeTargets({ exports: {} })).toEqual(['']);
  });
});

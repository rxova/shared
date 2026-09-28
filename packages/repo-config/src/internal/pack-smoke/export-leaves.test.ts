import { describe, expect, it } from 'vitest';
import { exportLeaves } from '@/internal/pack-smoke/export-leaves';

describe('exportLeaves', () => {
  it('walks strings, conditions, subpaths and fallback arrays', () => {
    expect(
      exportLeaves({
        '.': { types: { import: './a.d.ts', require: './a.d.cts' }, default: './a.js' },
        './b': ['./b.js', { node: './b.cjs' }],
        './internal/*': null,
      }),
    ).toEqual(['./a.d.ts', './a.d.cts', './a.js', './b.js', './b.cjs']);
  });

  it('reads a bare string and ignores anything else', () => {
    expect(exportLeaves('./index.js')).toEqual(['./index.js']);
    expect(exportLeaves(undefined)).toEqual([]);
    expect(exportLeaves(3)).toEqual([]);
  });
});

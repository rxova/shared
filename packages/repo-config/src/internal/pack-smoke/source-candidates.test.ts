import { describe, expect, it } from 'vitest';
import { sourceCandidates } from '@/internal/pack-smoke/source-candidates';

describe('sourceCandidates', () => {
  it('maps a built JavaScript file to its possible sources under src/', () => {
    expect(sourceCandidates('dist/client.cjs')).toEqual([
      'src/client.ts',
      'src/client.tsx',
      'src/client.mts',
      'src/client.cts',
      'src/client.js',
      'src/client.jsx',
      'src/client.mjs',
      'src/client.cjs',
    ]);
    expect(sourceCandidates('build/nested/a.mjs')[0]).toBe('src/nested/a.ts');
  });

  it('has none for a file that is not JavaScript', () => {
    expect(sourceCandidates('dist/index.d.ts')).toEqual([]);
    expect(sourceCandidates('package.json')).toEqual([]);
  });
});

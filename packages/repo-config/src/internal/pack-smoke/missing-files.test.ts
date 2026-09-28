import { describe, expect, it } from 'vitest';
import { missingFiles } from '@/internal/pack-smoke/missing-files';

const CONTENTS = ['LICENSE', 'README.md', 'assets/logo.svg', 'dist/index.js', 'schemas/a.json'];

describe('missingFiles', () => {
  it('finds top-level, nested, directory and glob entries', () => {
    expect(
      missingFiles(['LICENSE', 'assets/logo.svg', 'assets', 'dist/', 'schemas/*.json'], CONTENTS),
    ).toEqual([]);
  });

  it('names each entry that matches nothing', () => {
    expect(missingFiles(['assets/icon.svg', 'llms.txt', 'schemas/*.yaml'], CONTENTS)).toEqual([
      'assets/icon.svg',
      'llms.txt',
      'schemas/*.yaml',
    ]);
  });

  it('never wants a negated entry', () => {
    expect(missingFiles(['!dist/*.map'], CONTENTS)).toEqual([]);
  });
});

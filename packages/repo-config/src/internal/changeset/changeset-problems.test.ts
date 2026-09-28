import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { changesetProblems } from '@/internal/changeset/changeset-problems';

const files: Record<string, string> = {
  'one.md': '---\n"a": patch\n---\n\nFix.\n',
  'two.md': '---\n"a": patch\n"b": minor\n---\n\nFix.\n',
  'commit.md': '---\n"a": patch\n---\n\ncommit: ({ x })\n',
};
const read = (file: string) => files[file.slice(join('/repo', '/').length)];

describe('changesetProblems', () => {
  it('passes clean changesets', () => {
    expect(changesetProblems('/repo', ['one.md', 'two.md'], read)).toEqual([]);
    expect(changesetProblems('/repo', ['one.md'], read, { singlePackage: true })).toEqual([]);
  });

  it('reports metadata lines always, and the package count only with singlePackage', () => {
    expect(changesetProblems('/repo', ['commit.md'], read)).toEqual([
      '  commit.md:5: "commit: ({ x })" starts with commit:, which the changelog reads as metadata, not prose',
    ]);
    expect(changesetProblems('/repo', ['two.md'], read, { singlePackage: true })).toEqual([
      '  two.md: names 2 packages, expected 1',
    ]);
  });

  it('reports a file it cannot read', () => {
    expect(changesetProblems('/repo', ['gone.md'], read)).toEqual(['  gone.md: could not be read']);
  });
});

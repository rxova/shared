import { describe, expect, it } from 'vitest';
import { changesetFiles } from './changeset-files.ts';

describe('changesetFiles', () => {
  it('keeps the changesets and drops everything else', () => {
    expect(
      changesetFiles([
        '.changeset/tidy-pandas-smile.md',
        '.changeset/README.md',
        '.changeset/config.json',
        'docs/changeset.md',
      ]),
    ).toEqual(['.changeset/tidy-pandas-smile.md']);
  });
});

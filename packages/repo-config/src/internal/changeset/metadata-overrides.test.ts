import { describe, expect, it } from 'vitest';
import { metadataOverrides } from '@/internal/changeset/metadata-overrides';

describe('metadataOverrides', () => {
  it('finds each metadata line in the summary, with its line in the file', () => {
    const content = [
      '---',
      '"@rxova/journey-core": minor',
      '---',
      '',
      'Adds a thing.',
      '',
      '```ts',
      '  commit: (value) => value,',
      '```',
      'PR: #12',
      'Pull request: 3',
      'author: @someone',
      'User: x',
    ].join('\n');
    expect(metadataOverrides(content)).toEqual([
      { line: 8, override: 'commit:', text: 'commit: (value) => value,' },
      { line: 10, override: 'pr: / pull: / pull request:', text: 'PR: #12' },
      { line: 11, override: 'pr: / pull: / pull request:', text: 'Pull request: 3' },
      { line: 12, override: 'author: / user:', text: 'author: @someone' },
      { line: 13, override: 'author: / user:', text: 'User: x' },
    ]);
  });

  it('leaves prose and the frontmatter alone', () => {
    expect(
      metadataOverrides('---\ncommit: abc\n---\n\nEvery commit: reviewed.\nThe pr: none.\n'),
    ).toEqual([]);
  });
});

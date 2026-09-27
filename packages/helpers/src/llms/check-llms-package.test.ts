// Each rule has a case that asserts it fails. A gate that cannot fail looks the
// same as one that never needed to.
import { afterEach, describe, expect, it } from 'vitest';
import { checkLlmsPackage } from '@rxova-helpers/llms/check-llms-package';
import {
  apiTable,
  cleanupLlmsRepos,
  INDEX,
  llmsRepo,
  PKG,
  wellFormed,
  type PackageSpec,
} from '@rxova-helpers/llms/llms-repo.fixtures';

afterEach(cleanupLlmsRepos);

const check = (spec: Partial<PackageSpec>, files = PKG.files) =>
  checkLlmsPackage(
    llmsRepo({ lib: { name: 'lib', llms: wellFormed('lib'), index: INDEX, ...spec } }),
    { ...PKG, files },
  ).map(({ reason }) => reason);

describe('checkLlmsPackage', () => {
  it('passes a well-formed file whose table matches the exports', () => {
    expect(check({})).toEqual([]);
  });

  it('fails when the file is missing', () => {
    expect(check({ llms: undefined })).toEqual([
      'has no llms.txt; every published package ships one',
    ]);
  });

  it('fails when the file is not in files, so it is not published', () => {
    expect(check({}, ['dist'])).toEqual([
      'does not list llms.txt in `files`, so the tarball leaves it out',
    ]);
  });

  it.each([
    ['a title copied from another package', wellFormed('other'), 'must open with "# lib"'],
    ['an empty file', '', 'found ""'],
    ['no summary', wellFormed('lib').replace('> A summary.', 'A summary.'), '"> " summary'],
    ['no install section', wellFormed('lib').replace('## Install', '## Setup'), '"## Install"'],
    ['no docs section', wellFormed('lib').replace('## Docs', '## Links'), '"## Docs"'],
  ])('fails on %s', (_, llms, expected) => {
    expect(check({ llms }).join('\n')).toContain(expected);
  });

  it('fails when the table documents an export that is gone', () => {
    expect(check({ llms: wellFormed('lib', apiTable('toError', 'toErrorOld')) })).toEqual([
      'llms.txt documents `toErrorOld`, which src/index.ts does not export',
    ]);
  });

  it('fails when an export is missing from the table', () => {
    expect(check({ index: `${INDEX}export type { ErrorClass } from './types'\n` })).toEqual([
      'llms.txt does not document `ErrorClass`, which src/index.ts exports',
    ]);
  });

  it('fails on a missing API section, and on each export it leaves out', () => {
    expect(check({ llms: wellFormed('lib', '') })).toEqual([
      'llms.txt has no "## API" section',
      'llms.txt does not document `toError`, which src/index.ts exports',
    ]);
  });

  it('fails when there is no src/index.ts to check against', () => {
    expect(check({ index: undefined })).toEqual([
      'has no src/index.ts to check the llms.txt API table against',
    ]);
  });
});

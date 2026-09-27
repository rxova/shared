import { afterEach, describe, expect, it } from 'vitest';
import { checkRootIndex } from '@rxova-helpers/llms/check-root-index';
import { cleanupLlmsRepos, llmsRepo, PKG } from '@rxova-helpers/llms/llms-repo.fixtures';

afterEach(cleanupLlmsRepos);

const two = [PKG, { dir: 'other', name: '@scope/other', files: [] }];
const index = (body?: string) =>
  checkRootIndex(llmsRepo({}, body), two).map(({ reason }) => reason);

describe('checkRootIndex', () => {
  it('passes when it links every published package', () => {
    expect(index('- [lib](packages/lib/llms.txt)\n- [other](packages/other/llms.txt)\n')).toEqual(
      [],
    );
  });

  it('fails for each package it does not link', () => {
    expect(index('- [lib](packages/lib/llms.txt)\n')).toEqual([
      'does not link packages/other/llms.txt, so @scope/other is missing from the index',
    ]);
  });

  it('fails when it is missing', () => {
    expect(index()).toEqual(['is missing at the repository root']);
  });
});

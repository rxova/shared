import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { collectLlmsFailures } from '@/internal/llms/collect-llms-failures';
import { cleanupLlmsRepos, INDEX, llmsRepo, wellFormed } from '@/internal/llms/llms-repo.fixtures';

afterEach(cleanupLlmsRepos);

describe('collectLlmsFailures', () => {
  it('checks every published package and the root index', () => {
    const root = llmsRepo(
      { lib: { name: 'lib', llms: wellFormed('lib'), index: INDEX }, other: { name: 'other' } },
      '- [lib](packages/lib/llms.txt)\n',
    );

    expect(collectLlmsFailures(root)).toEqual([
      { where: 'other', reason: 'has no llms.txt; every published package ships one' },
      {
        where: 'llms.txt',
        reason: 'does not link packages/other/llms.txt, so other is missing from the index',
      },
    ]);
  });

  it('applies the root config, lets a package override it, and can skip the index', () => {
    const root = llmsRepo({
      lib: { name: 'lib', llms: wellFormed('lib', ''), index: INDEX },
      cli: { name: 'cli', llms: wellFormed('cli', '').replace('## Install', '## Use') },
    });
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({
        repoConfig: { llms: { api: 'none', rootIndex: false, requiredTerms: ['npm i'] } },
      }),
    );
    writeFileSync(
      join(root, 'packages', 'cli', 'package.json'),
      JSON.stringify({
        name: 'cli',
        files: ['llms.txt'],
        repoConfig: { llms: { requiredTerms: ['npx cli'] } },
      }),
    );
    expect(collectLlmsFailures(root)).toEqual([
      { where: 'cli', reason: 'llms.txt does not mention "npx cli"' },
    ]);
  });
});

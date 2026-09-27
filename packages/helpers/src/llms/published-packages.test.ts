import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupLlmsRepos, llmsRepo } from '@rxova-helpers/llms/llms-repo.fixtures';
import { publishedPackages } from '@rxova-helpers/llms/published-packages';

afterEach(cleanupLlmsRepos);

describe('publishedPackages', () => {
  it('lists the packages that are not private', () => {
    const root = llmsRepo({
      lib: { name: 'lib' },
      tooling: { name: '@repo/tooling', private: true },
    });
    mkdirSync(join(root, 'packages', 'empty'));
    writeFileSync(join(root, 'packages', 'README.md'), '');

    expect(publishedPackages(root)).toEqual([
      { dir: 'lib', name: 'lib', files: ['dist', 'llms.txt'] },
    ]);
  });

  it('is empty where there is no packages directory', () => {
    expect(publishedPackages(llmsRepo({}))).toEqual([]);
  });

  it('reads a missing files array as empty, and names a nameless package after its directory', () => {
    const root = llmsRepo({ lib: { name: 'lib' } });
    writeFileSync(join(root, 'packages', 'lib', 'package.json'), '{}');

    expect(publishedPackages(root)).toEqual([{ dir: 'lib', name: 'lib', files: [] }]);
  });
});

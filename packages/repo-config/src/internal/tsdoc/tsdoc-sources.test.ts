import { afterAll, describe, expect, it } from 'vitest';
import { cleanupTsdocRepos, tsdocRepo } from '@/internal/tsdoc/tsdoc-repo.fixtures';
import { tsdocSources } from '@/internal/tsdoc/tsdoc-sources';

afterAll(cleanupTsdocRepos);

describe('tsdocSources', () => {
  const root = tsdocRepo({
    'packages/core/package.json': { name: '@x/core' },
    'packages/core/src/index.ts': '',
    'packages/core/tsconfig.json': '{}',
    'packages/bare/package.json': { name: 'bare' },
    'packages/bare/src/index.ts': '',
    'packages/noentry/package.json': { name: 'noentry' },
    'packages/private/package.json': { name: 'private', private: true },
    'packages/private/src/index.ts': '',
    'packages/custom/package.json': { name: 'custom' },
    'packages/custom/src/main.ts': '',
    'packages/nameless/package.json': {},
    'packages/nameless/src/index.ts': '',
  });

  it('finds each published entry and its tsconfig', () => {
    expect(tsdocSources(root, { custom: 'packages/custom/src/main.ts' })).toEqual([
      { name: 'bare', entry: 'packages/bare/src/index.ts', tsconfig: undefined },
      {
        name: '@x/core',
        entry: 'packages/core/src/index.ts',
        tsconfig: 'packages/core/tsconfig.json',
      },
      { name: 'custom', entry: 'packages/custom/src/main.ts', tsconfig: undefined },
      { name: 'nameless', entry: 'packages/nameless/src/index.ts', tsconfig: undefined },
    ]);
  });

  it('refuses a configured entry that does not exist', () => {
    expect(() => tsdocSources(root, { bare: 'packages/bare/src/nope.ts' })).toThrow(
      'repoConfig.tsdoc.entries names packages/bare/src/nope.ts for bare, which does not exist',
    );
  });
});

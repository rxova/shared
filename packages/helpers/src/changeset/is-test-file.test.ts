import { describe, expect, it } from 'vitest';
import { isTestFile } from '@rxova-helpers/changeset/is-test-file';

describe('isTestFile', () => {
  it.each([
    'src/index.test.ts',
    'src/view.spec.tsx',
    'src/a.test.mjs',
    'src/__tests__/fixture.ts',
    'src/__fixtures__/patch.diff',
    'packages/example/e2e/cli.ts',
  ])('recognises %s', (file) => {
    expect(isTestFile(file)).toBe(true);
  });

  it.each(['src/index.ts', 'src/testing.ts', 'README.md', 'src/e2e-helper.ts', 'e2e.ts'])(
    'does not mistake %s for one',
    (file) => {
      expect(isTestFile(file)).toBe(false);
    },
  );
});

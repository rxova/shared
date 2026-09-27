import { describe, expect, it } from 'vitest';
import { touchesPackage } from './touches-package.js';

const PUBLISHED = ['example'];

describe('touchesPackage', () => {
  it('sees a source change', () => {
    expect(touchesPackage(['packages/example/src/index.ts'], PUBLISHED)).toBe(true);
  });

  it.each([
    'packages/example/README.md',
    'packages/example/src/index.test.ts',
    'packages/example/src/__tests__/fixture.ts',
    'packages/example/src/view.test.tsx',
    'packages/example/src/__fixtures__/patch.diff',
    'packages/example/e2e/cli.ts',
    'packages/example-two/src/index.ts',
    'packages/tooling/src/cli.ts',
    'apps/docs/src/content/docs/index.mdx',
    '.github/workflows/ci.yml',
    'README.md',
  ])('does not count %s as publishable', (file) => {
    expect(touchesPackage([file], PUBLISHED)).toBe(false);
  });

  it('is true as soon as one file in the set ships', () => {
    expect(touchesPackage(['README.md', 'packages/example/src/index.ts'], PUBLISHED)).toBe(true);
  });

  it('is false for an empty diff', () => {
    expect(touchesPackage([], PUBLISHED)).toBe(false);
  });
});

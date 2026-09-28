import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { shippedChanges } from '@/internal/changeset/shipped-changes';

const manifests: Record<string, string> = {
  [join('/repo', 'packages', 'otp', 'package.json')]: JSON.stringify({
    name: '@rxova/react-otp-input',
    files: ['dist', 'llms.txt'],
  }),
  [join('/repo', 'packages', 'bare', 'package.json')]: JSON.stringify({ name: 'bare' }),
};
const read = (file: string) => manifests[file];

describe('shippedChanges', () => {
  it('keeps what a published package ships, docs included', () => {
    const changed = [
      'packages/otp/src/index.ts',
      'packages/otp/README.md',
      'packages/otp/llms.txt',
      'packages/otp/src/index.test.ts',
      'packages/otp/demo/Demo.tsx',
      'packages/bare/src/index.ts',
      'packages/bare/package.json',
      'packages/private/src/index.ts',
      'packages/gone/src/index.ts',
      'apps/docs/index.md',
      'packages',
      'README.md',
    ];
    expect(shippedChanges(changed, ['otp', 'bare', 'gone'], '/repo', read)).toEqual([
      'packages/otp/src/index.ts',
      'packages/otp/README.md',
      'packages/otp/llms.txt',
      'packages/bare/package.json',
    ]);
  });
});

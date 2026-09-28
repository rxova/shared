import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { readFile } from '@/internal/config/read-file';
import { versionedPackages } from '@/internal/changeset/versioned-packages';

const root = mkdtempSync(join(tmpdir(), 'versioned-packages-'));
const write = (dir: string, manifest: object | undefined) => {
  mkdirSync(join(root, dir), { recursive: true });
  if (manifest) writeFileSync(join(root, dir, 'package.json'), JSON.stringify(manifest));
};
write('packages/core', { name: '@rxova/journey-core' });
write('packages/react', { name: '@rxova/journey-react' });
write('packages/common', { name: '@rxova/journey-common', private: true });
write('packages/ignored', { name: 'ignored' });
write('packages/nameless', {});
write('packages/empty', undefined);
write('apps/docs', { name: 'docs', private: true });
writeFileSync(join(root, 'packages', 'README.md'), '');
mkdirSync(join(root, '.changeset'));
writeFileSync(join(root, '.changeset', 'config.json'), JSON.stringify({ ignore: ['ignored'] }));

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('versionedPackages', () => {
  it('lists the public, named, not-ignored packages with their tokens', () => {
    expect(versionedPackages(root, readFile)).toEqual([
      { name: '@rxova/journey-core', tokens: ['@rxova/journey-core', 'journey-core', 'core'] },
      { name: '@rxova/journey-react', tokens: ['@rxova/journey-react', 'journey-react', 'react'] },
    ]);
  });

  it('adds the private ones and the unprefixed aliases when asked', () => {
    const found = versionedPackages(root, readFile, {
      includePrivate: true,
      aliasPrefix: 'journey-',
      roots: ['packages', 'apps', 'missing'],
    });
    expect(found.map(({ name }) => name)).toEqual([
      '@rxova/journey-common',
      '@rxova/journey-core',
      '@rxova/journey-react',
      'docs',
    ]);
    expect(found[1]?.tokens).toEqual(['@rxova/journey-core', 'journey-core', 'core']);
  });

  it('works without a changesets config', () => {
    expect(versionedPackages(root, () => undefined)).toEqual([]);
  });
});

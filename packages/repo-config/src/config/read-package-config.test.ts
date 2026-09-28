import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readPackageConfig } from '@/config/read-package-config';

describe('readPackageConfig', () => {
  it('reads the repoConfig of the manifest in the directory', () => {
    const files: Record<string, string> = {
      [join('/pkg', 'package.json')]: JSON.stringify({
        name: 'x',
        repoConfig: { packSmoke: { load: 'never' } },
      }),
    };
    expect(readPackageConfig('/pkg', (file) => files[file])).toEqual({
      packSmoke: { load: 'never' },
    });
  });

  it('is empty without a manifest or without the field', () => {
    expect(readPackageConfig('/none', () => undefined)).toEqual({});
    expect(readPackageConfig('/pkg', () => '{"name":"x"}')).toEqual({});
  });

  it('reads the real file system by default', () => {
    expect(readPackageConfig('/no/such/dir')).toEqual({});
  });
});

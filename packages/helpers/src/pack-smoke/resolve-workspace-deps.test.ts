import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import type { PackageManifest } from '@rxova-tooling/manifest/manifest.types';
import {
  fakeNpm,
  memoryScratch,
  PARENT,
  SCRATCH,
} from '@rxova-helpers/pack-smoke/memory-scratch.fixtures';
import type { Shell } from '@rxova-tooling/pack-smoke/pack-smoke.types';
import { resolveWorkspaceDeps } from '@rxova-helpers/pack-smoke/resolve-workspace-deps';

const TARBALL = join(SCRATCH, 'scope-example-0.1.0.tgz');

describe('resolveWorkspaceDeps', () => {
  it('does nothing for a package without workspace dependencies', () => {
    const { fs } = memoryScratch({ name: 'x', version: '1.0.0', dependencies: { zod: '^4' } });
    const sh = vi.fn(fakeNpm());
    resolveWorkspaceDeps('/pkg', { name: 'x', dependencies: { zod: '^4' } }, TARBALL, SCRATCH, {
      sh,
      fs,
    });
    expect(sh).not.toHaveBeenCalled();
    resolveWorkspaceDeps('/pkg', { name: 'x' }, TARBALL, SCRATCH, { sh, fs });
    expect(sh).not.toHaveBeenCalled();
  });

  it('packs each workspace dependency and repacks the package pointing at it', () => {
    const manifest = {
      name: '@scope/example',
      version: '0.1.0',
      dependencies: { '@scope/core': 'workspace:^', zod: '^4.0.0' },
    };
    const { fs, files } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, 'package', 'package.json')]: JSON.stringify(manifest),
        [join('/', 'core', 'package.json')]: JSON.stringify({ name: '@scope/core' }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ['core', 'pkg'] : listed(dir));
    const calls: string[] = [];
    const sh: Shell = (command, args, cwd) => {
      calls.push(`${command} ${args.join(' ')} @ ${cwd}`);
      return args.includes('--json')
        ? JSON.stringify([{ filename: 'scope-core-0.0.0.tgz' }])
        : fakeNpm()(command, args, cwd);
    };

    resolveWorkspaceDeps('/pkg', manifest, TARBALL, SCRATCH, { sh, fs });

    expect(calls).toEqual([
      `tar -xzf ${TARBALL} -C ${SCRATCH} @ ${SCRATCH}`,
      `npm pack --ignore-scripts --json --pack-destination ${SCRATCH} @ ${join('/', 'core')}`,
      `npm pack --ignore-scripts --pack-destination ${SCRATCH} @ ${join(SCRATCH, 'package')}`,
    ]);
    const repacked = JSON.parse(
      files.get(join(SCRATCH, 'package', 'package.json')) ?? '',
    ) as PackageManifest;
    expect(repacked.dependencies).toEqual({
      '@scope/core': `file:${join(SCRATCH, 'scope-core-0.0.0.tgz')}`,
      zod: '^4.0.0',
    });
  });
});

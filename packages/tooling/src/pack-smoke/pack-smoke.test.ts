import type { Shell } from '@/pack-smoke/pack-smoke.types';
import {
  fakeNpm,
  memoryScratch,
  PARENT,
  SCRATCH,
} from '@rxova-helpers/pack-smoke/memory-scratch.fixtures';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { packSmoke } from '@/pack-smoke/pack-smoke';

describe('packSmoke', () => {
  it('packs, installs, imports, and cleans up', () => {
    const { fs, files, removed } = memoryScratch({ name: '@scope/example', version: '0.1.0' });
    const calls: string[] = [];
    const sh: Shell = (command, args, cwd) => {
      calls.push(`${command} ${args[0] ?? ''} @ ${cwd}`);
      return fakeNpm()(command, args, cwd);
    };

    expect(packSmoke({ pkgDir: '/pkg', sh, fs })).toBe(
      'pack:smoke ok — @scope/example@0.1.0 installs, imports and requires from a tarball',
    );
    expect(calls).toEqual([
      'npm pack @ /pkg',
      `npm install @ ${SCRATCH}`,
      `node ${join(SCRATCH, 'probe.mjs')} @ ${SCRATCH}`,
    ]);
    expect(files.get(join(SCRATCH, 'probe.mjs'))).toContain('@scope/example');
    expect(removed).toEqual([SCRATCH]);
  });

  it('resolves workspace dependencies before installing', () => {
    const manifest = {
      name: '@scope/example',
      version: '0.1.0',
      dependencies: { '@scope/core': 'workspace:^' },
    };
    const { fs } = memoryScratch(manifest, {
      extra: {
        [join(SCRATCH, 'package', 'package.json')]: JSON.stringify(manifest),
        [join('/', 'core', 'package.json')]: JSON.stringify({ name: '@scope/core' }),
      },
    });
    const listed = fs.list;
    fs.list = (dir) => (dir === PARENT ? ['core', 'pkg'] : listed(dir));
    const sh: Shell = (command, args, cwd) =>
      args.includes('--json')
        ? JSON.stringify([{ filename: 'scope-core-0.0.0.tgz' }])
        : fakeNpm()(command, args, cwd);

    expect(packSmoke({ pkgDir: '/pkg', sh, fs })).toContain('@scope/example@0.1.0 installs');
  });

  it('runs every bin the package declares', () => {
    const { fs } = memoryScratch({
      name: 'tool',
      version: '1.2.3',
      bin: { tool: './dist/cli.js' },
    });
    const sh = vi.fn(fakeNpm());
    packSmoke({ pkgDir: '/pkg', sh, fs });
    expect(sh).toHaveBeenCalledWith('npx', ['--no-install', 'tool', '--version'], SCRATCH);
  });

  it('fails when npm pack wrote no tarball, and still cleans up', () => {
    const { fs, removed } = memoryScratch({ name: 'x', version: '1.0.0' }, { tarball: false });
    expect(() => packSmoke({ pkgDir: '/pkg', sh: fakeNpm(), fs })).toThrow('produced no tarball');
    expect(removed).toEqual([SCRATCH]);
  });

  it('fails when the installed package is missing a shipped file', () => {
    const { fs, removed } = memoryScratch(
      { name: 'x', version: '1.0.0', files: ['dist', 'schema.json'] },
      { installed: ['README.md', 'dist', 'package.json'] },
    );
    expect(() => packSmoke({ pkgDir: '/pkg', sh: fakeNpm(), fs })).toThrow(
      'the tarball does not contain LICENSE, schema.json',
    );
    expect(removed).toEqual([SCRATCH]);
  });

  it('fails when a bin prints something that is not a version', () => {
    const { fs } = memoryScratch({ name: 'tool', version: '1.0.0', bin: './cli.js' });
    expect(() =>
      packSmoke({ pkgDir: '/pkg', sh: fakeNpm({ version: 'command not found' }), fs }),
    ).toThrow('unusable version');
  });

  it('fails when the probe does not print ok', () => {
    const { fs } = memoryScratch({ name: 'x', version: '1.0.0' });
    expect(() => packSmoke({ pkgDir: '/pkg', sh: fakeNpm({ probe: 'boom' }), fs })).toThrow(
      'probe failed: boom',
    );
  });

  it('tolerates a manifest without a name or a version', () => {
    const { fs } = memoryScratch({});
    expect(packSmoke({ pkgDir: '/pkg', sh: fakeNpm(), fs })).toBe(
      'pack:smoke ok — @ installs, imports and requires from a tarball',
    );
  });
});

import { join } from 'node:path';
import type { PackageManifest } from '@/manifest/manifest.types';
import type { ScratchFiles, Shell } from '@/pack-smoke/pack-smoke.types';

export const SCRATCH = '/scratch';
/** Where the workspace packages sit beside `/pkg`, spelled the way `join` spells it here. */
export const PARENT = join('/pkg', '..');
/** What a healthy tarball holds, as `tar -tzf` lists it. */
export const HEALTHY_TARBALL = [
  'package/LICENSE',
  'package/README.md',
  'package/package.json',
  'package/dist/index.js',
];

/**
 * An in-memory scratch space holding one package manifest at `/pkg`. Listing
 * the scratch directory shows the tarball; listing anything else shows
 * nothing.
 */
export const memoryScratch = (
  manifest: PackageManifest,
  { tarball = true, extra = {} }: { tarball?: boolean; extra?: Record<string, string> } = {},
) => {
  const files = new Map<string, string>([
    [join('/pkg', 'package.json'), JSON.stringify(manifest)],
    ...Object.entries(extra),
  ]);
  const removed: string[] = [];
  const fs: ScratchFiles = {
    make: () => SCRATCH,
    list: (dir) => (dir === SCRATCH && tarball ? ['scope-example-0.1.0.tgz'] : []),
    read: (file) => {
      const contents = files.get(file);
      if (contents === undefined) throw new Error(`ENOENT: ${file}`);
      return contents;
    },
    write: (file, contents) => void files.set(file, contents),
    remove: (dir) => void removed.push(dir),
  };
  return { fs, files, removed };
};

/** A shell that answers like a healthy npm and tar, with per-command overrides. */
export const fakeNpm =
  (overrides: { version?: string; probe?: string; contents?: readonly string[] } = {}): Shell =>
  (command, args) => {
    if (command === 'npx') return `${overrides.version ?? '1.2.3'}\n`;
    if (command === 'node') return `${overrides.probe ?? 'ok'}\n`;
    if (command === 'tar' && args[0] === '-tzf') {
      return `${(overrides.contents ?? HEALTHY_TARBALL).join('\n')}\n`;
    }
    return args.join(' ');
  };

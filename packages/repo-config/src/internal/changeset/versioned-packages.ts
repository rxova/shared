import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Reader } from '@/config/config.types';
import type { PackageManifest } from '@/manifest/manifest.types';

/** A workspace package a changeset can name, and the tokens that name it on the command line. */
export interface VersionedPackage {
  name: string;
  tokens: string[];
}

/**
 * The packages under `roots` a changeset can bump: named, not ignored by
 * `.changeset/config.json`, and public unless `includePrivate`. Each is
 * reachable by its full name, its name without the scope, its directory, and
 * — with `aliasPrefix` — those without the prefix, all lower-cased. Sorted by name.
 */
export const versionedPackages = (
  root: string,
  read: Reader,
  {
    roots = ['packages', 'apps'],
    aliasPrefix,
    includePrivate = false,
  }: {
    roots?: string[] | undefined;
    aliasPrefix?: string | undefined;
    includePrivate?: boolean | undefined;
  } = {},
): VersionedPackage[] => {
  const config = read(join(root, '.changeset', 'config.json'));
  const ignored = new Set((config && (JSON.parse(config) as { ignore?: string[] }).ignore) ?? []);
  const unprefixed = (token: string) =>
    aliasPrefix !== undefined && token.startsWith(aliasPrefix)
      ? [token.slice(aliasPrefix.length)]
      : [];

  return roots
    .flatMap((top) => {
      const dir = join(root, top);
      if (!existsSync(dir)) return [];
      return readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) => {
          const text = read(join(dir, entry.name, 'package.json'));
          if (text === undefined) return [];
          const manifest = JSON.parse(text) as PackageManifest;
          const name = manifest.name?.trim() ?? '';
          if (name === '' || ignored.has(name)) return [];
          if (manifest.private === true && !includePrivate) return [];
          const bare = name.replace(/^@[^/]+\//, '');
          const tokens = [name, bare, entry.name].map((token) => token.toLowerCase());
          return [{ name, tokens: [...new Set([...tokens, ...tokens.flatMap(unprefixed)])] }];
        });
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

import { join } from 'node:path';
import type { Reader } from '@/config/config.types';
import { metadataOverrides } from '@/internal/changeset/metadata-overrides';
import { packagesNamed } from '@/internal/changeset/packages-named';

/**
 * One line per problem in the changeset `files` (paths relative to `root`, as
 * they are reported): a summary line `@changesets/changelog-github` would read as
 * metadata, and — with `singlePackage` — a changeset that does not name
 * exactly one package.
 */
export const changesetProblems = (
  root: string,
  files: readonly string[],
  read: Reader,
  { singlePackage = false }: { singlePackage?: boolean } = {},
): string[] =>
  files.flatMap((file) => {
    const body = read(join(root, file));
    if (body === undefined) return [`  ${file}: could not be read`];
    const overrides = metadataOverrides(body).map(
      ({ line, override, text }) =>
        `  ${file}:${String(line)}: "${text}" starts with ${override}, which the changelog reads as metadata, not prose`,
    );
    const count = packagesNamed(body);
    const named =
      singlePackage && count !== 1
        ? [`  ${file}: names ${String(count)} packages, expected 1`]
        : [];
    return [...overrides, ...named];
  });

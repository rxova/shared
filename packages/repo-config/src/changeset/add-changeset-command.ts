import { changesetBody } from '@/internal/changeset/changeset-body';
import { changesetFileName } from '@/internal/changeset/changeset-file-name';
import { parseAddArgs } from '@/internal/changeset/parse-add-args';
import { resolvePackageToken } from '@/internal/changeset/resolve-package-token';
import { versionedPackages } from '@/internal/changeset/versioned-packages';
import { readFile } from '@/internal/config/read-file';
import type { Reader } from '@/config/config.types';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config add-changeset <package> <patch|minor|major> <summary…>`:
 * writes a one-package changeset without the interactive prompt, so a script
 * or an agent can record a release note. `<package>` is the package name, its
 * name without the scope, or its directory (and, with
 * `repoConfig.changeset.aliasPrefix`, those without the prefix). The packages
 * come from `repoConfig.changeset.roots` (`packages`, `apps`), minus
 * `.changeset/config.json#ignore` and — unless `includePrivate` — private
 * ones. `--help` lists them. Returns the process exit code.
 */
export const addChangesetCommand = (
  argv: readonly string[],
  {
    root = process.cwd(),
    read = readFile,
    write = (file: string, contents: string) => {
      mkdirSync(join(file, '..'), { recursive: true });
      writeFileSync(file, contents);
    },
    now = Date.now,
  }: {
    root?: string;
    read?: Reader;
    write?: (file: string, contents: string) => void;
    now?: () => number;
  } = {},
): number => {
  try {
    const { roots, aliasPrefix, includePrivate } = readConfig(root, read).changeset ?? {};
    const packages = versionedPackages(root, read, { roots, aliasPrefix, includePrivate });
    if (argv.includes('--help') || argv.includes('-h')) {
      console.log(
        [
          'usage: rxova-repo-config add-changeset <package> <patch|minor|major> <summary>',
          '       rxova-repo-config add-changeset -p <package> -t <patch|minor|major> -s <summary>',
          '',
          'packages:',
          ...packages.map(({ name }) => `  ${name}`),
        ].join('\n'),
      );
      return 0;
    }
    const { token, bump, summary } = parseAddArgs(argv);
    const name = resolvePackageToken(token, packages);
    const file = join('.changeset', changesetFileName(name, now()));
    write(join(root, file), changesetBody(name, bump, summary));
    console.log(`add-changeset: wrote ${file} (${name}: ${bump})`);
    return 0;
  } catch (failure) {
    console.error(`add-changeset: ${(failure as Error).message}`);
    return 1;
  }
};

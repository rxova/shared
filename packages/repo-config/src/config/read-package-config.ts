import { readFile } from '@/internal/config/read-file';
import type { PackageConfig, Reader } from '@/config/config.types';
import { join } from 'node:path';
import { parsePackageConfig } from '@/config/parse-package-config';

/**
 * The `repoConfig` settings in the `package.json` of the package at `dir`, or
 * none. A package that differs from its siblings says so in its own manifest,
 * next to the fields the difference is about.
 */
export const readPackageConfig = (dir: string, read: Reader = readFile): PackageConfig => {
  const manifest = read(join(dir, 'package.json'));
  if (manifest === undefined) return {};
  return parsePackageConfig((JSON.parse(manifest) as { repoConfig?: unknown }).repoConfig);
};

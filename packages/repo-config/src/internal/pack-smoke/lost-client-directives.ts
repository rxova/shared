import { join } from 'node:path';
import type { PackageManifest } from '@/manifest/manifest.types';
import { directivesOf } from '@/internal/pack-smoke/directives-of';
import { exportTargets } from '@/internal/pack-smoke/export-targets';
import { readIfPresent } from '@/internal/pack-smoke/read-if-present';
import { sourceCandidates } from '@/internal/pack-smoke/source-candidates';

/**
 * The built entries whose source opens with a `'use client'` directive but
 * which no longer do, as `target (from source)`. A bundler that drops the
 * directive ships a package that breaks inside a React Server Components
 * tree, and nothing before a consumer's build notices. An entry whose source
 * has no directive, or whose source is not found, is not checked.
 */
export const lostClientDirectives = (
  manifest: PackageManifest,
  {
    pkgDir,
    installedDir,
    read,
  }: { pkgDir: string; installedDir: string; read: (file: string) => string },
): string[] =>
  exportTargets(manifest).flatMap((target) => {
    for (const source of sourceCandidates(target)) {
      const text = readIfPresent(read, join(pkgDir, source));
      if (text === undefined) continue;
      if (!directivesOf(text).includes('use client')) return [];
      const built = readIfPresent(read, join(installedDir, target));
      return built !== undefined && directivesOf(built).includes('use client')
        ? []
        : [`${target} (from ${source})`];
    }
    return [];
  });

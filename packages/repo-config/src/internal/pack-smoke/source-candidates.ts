import { SOURCE_EXTENSIONS } from '@/internal/pack-smoke/source-extensions';

/**
 * Where the source of a built JavaScript file would sit: `dist/client.cjs`
 * comes from `src/client.ts`, `.tsx`, or another source extension. The first
 * directory of the target is the build's output directory, whatever it is
 * called. A target that is not JavaScript has no candidates.
 */
export const sourceCandidates = (target: string): string[] => {
  if (!/\.[cm]?js$/.test(target)) return [];
  const stem = target.replace(/^[^/]+\//, '').replace(/\.[cm]?js$/, '');
  return SOURCE_EXTENSIONS.map((extension) => `src/${stem}.${extension}`);
};

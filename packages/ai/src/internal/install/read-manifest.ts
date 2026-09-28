import type { Manifest } from '@/install/install.types';
import { fromTarget } from '@/internal/install/from-target';
import { isRecord } from '@/internal/install/is-record';
import { readJson } from '@/internal/install/read-json';
import { MANIFEST } from '@/internal/install/install-paths';

/** The manifest of the last install into `target`, or undefined when there is none. */
export const readManifest = (target: string): Manifest | undefined => {
  const value = readJson(fromTarget(target, MANIFEST));
  if (!isRecord(value) || typeof value.version !== 'string' || !Array.isArray(value.files))
    return undefined;
  return {
    version: value.version,
    files: value.files.filter((file): file is string => typeof file === 'string'),
  };
};

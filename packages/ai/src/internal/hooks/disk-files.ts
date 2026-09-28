import { existsSync, readFileSync } from 'node:fs';
import type { GuardFiles } from '@/hooks/guard.types';

/** The real file system, for the guards. */
export const diskFiles: GuardFiles = {
  exists: (path) => existsSync(path),
  read: (path) => {
    try {
      return readFileSync(path, 'utf8');
    } catch {
      return undefined;
    }
  },
};

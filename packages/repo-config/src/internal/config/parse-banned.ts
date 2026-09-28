import type { BannedPattern } from '@/config/config.types';
import { assertOnlyKeys } from '@/internal/config/assert-only-keys';
import { compact } from '@/internal/config/compact';
import { failConfig } from '@/internal/config/fail-config';
import { isRecord } from '@/internal/config/is-record';
import { readPattern } from '@/internal/config/read-pattern';
import { readString } from '@/internal/config/read-string';

/** `repoConfig.docs.banned`: `{ name, pattern, flags? }` entries whose patterns compile. */
export const parseBanned = (value: unknown, path: string): BannedPattern[] => {
  if (!Array.isArray(value)) return failConfig(path, 'an array');
  return value.map((entry: unknown, index) => {
    const at = `${path}[${String(index)}]`;
    if (!isRecord(entry)) return failConfig(at, 'a { name, pattern, flags? } object');
    assertOnlyKeys(entry, at, ['name', 'pattern', 'flags']);
    const flags = readString(entry, 'flags', at);
    if (flags !== undefined && !/^[imsu]+$/.test(flags)) {
      return failConfig(`${at}.flags`, 'made of the flags i, m, s and u');
    }
    const name = readString(entry, 'name', at);
    const pattern = readPattern(entry, 'pattern', at, flags);
    if (name === undefined || pattern === undefined) {
      return failConfig(at, 'a { name, pattern, flags? } object');
    }
    return compact<BannedPattern>({ name, pattern, flags });
  });
};

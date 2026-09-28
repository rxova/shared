import { assertOnlyKeys } from '@/internal/config/assert-only-keys';
import { compact } from '@/internal/config/compact';
import { failConfig } from '@/internal/config/fail-config';
import { isRecord } from '@/internal/config/is-record';
import { parseLlmsConfig } from '@/internal/config/parse-llms-config';
import { parsePackSmokeConfig } from '@/internal/config/parse-pack-smoke-config';
import { readSection } from '@/internal/config/read-section';
import { readString } from '@/internal/config/read-string';
import type { PackageConfig } from '@/config/config.types';

/**
 * Checks the raw `repoConfig` value of one package's own `package.json`: the
 * settings that differ package by package (how pack-smoke probes it, its
 * `llms.txt` rules, its `attw` profile). Unknown keys are errors, as at the root.
 */
export const parsePackageConfig = (raw: unknown): PackageConfig => {
  if (raw === undefined) return {};
  if (!isRecord(raw)) return failConfig('repoConfig', 'an object');
  assertOnlyKeys(raw, 'repoConfig', ['packSmoke', 'llms', 'exports']);

  const packSmoke = readSection(raw, 'packSmoke', 'repoConfig', ['load', 'bins', 'run']);
  const llms = readSection(raw, 'llms', 'repoConfig', [
    'api',
    'requiredTerms',
    'idPattern',
    'idsFrom',
  ]);
  const exports = readSection(raw, 'exports', 'repoConfig', ['profile']);
  return compact<PackageConfig>({
    packSmoke: packSmoke && parsePackSmokeConfig(packSmoke, 'repoConfig.packSmoke'),
    llms: llms && parseLlmsConfig(llms, 'repoConfig.llms', { packageLevel: true }),
    exports: exports && compact({ profile: readString(exports, 'profile', 'repoConfig.exports') }),
  });
};

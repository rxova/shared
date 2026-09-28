import { assertOnlyKeys } from '@/internal/config/assert-only-keys';
import { failConfig } from '@/internal/config/fail-config';
import { isRecord } from '@/internal/config/is-record';
import { parseSteps } from '@/internal/config/parse-steps';
import type { RepoConfig } from '@/config/config.types';

/**
 * Checks the raw `repoConfig` value of a root `package.json` and returns it typed.
 *
 * Validated rather than trusted: a typo would otherwise silently fall back to
 * a default, which is the kind of quiet drift the shared scripts exist to end.
 */
export const parseConfig = (raw: unknown): RepoConfig => {
  if (raw === undefined) return {};
  if (!isRecord(raw)) return failConfig('repoConfig', 'an object');
  assertOnlyKeys(raw, 'repoConfig', ['verify', 'changeset']);

  const config: RepoConfig = {};
  if (raw.verify !== undefined) {
    if (!isRecord(raw.verify)) return failConfig('repoConfig.verify', 'an object');
    assertOnlyKeys(raw.verify, 'repoConfig.verify', ['steps']);
    config.verify = raw.verify.steps === undefined ? {} : { steps: parseSteps(raw.verify.steps) };
  }
  if (raw.changeset !== undefined) {
    if (!isRecord(raw.changeset)) return failConfig('repoConfig.changeset', 'an object');
    assertOnlyKeys(raw.changeset, 'repoConfig.changeset', ['singlePackage']);
    const { singlePackage } = raw.changeset;
    if (singlePackage !== undefined && typeof singlePackage !== 'boolean') {
      return failConfig('repoConfig.changeset.singlePackage', 'a boolean');
    }
    config.changeset = singlePackage === undefined ? {} : { singlePackage };
  }
  return config;
};

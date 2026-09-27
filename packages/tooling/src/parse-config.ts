import { assertOnlyKeys, failConfig, isRecord, parseSteps } from '@rxova/helpers';
import type { ToolingConfig } from './config.types.js';

/**
 * Checks the raw `tooling` value of a root `package.json` and returns it typed.
 *
 * Validated rather than trusted: a typo would otherwise silently fall back to
 * a default, which is the kind of quiet drift the shared scripts exist to end.
 */
export const parseConfig = (raw: unknown): ToolingConfig => {
  if (raw === undefined) return {};
  if (!isRecord(raw)) return failConfig('tooling', 'an object');
  assertOnlyKeys(raw, 'tooling', ['verify', 'changeset']);

  const config: ToolingConfig = {};
  if (raw.verify !== undefined) {
    if (!isRecord(raw.verify)) return failConfig('tooling.verify', 'an object');
    assertOnlyKeys(raw.verify, 'tooling.verify', ['steps']);
    config.verify = raw.verify.steps === undefined ? {} : { steps: parseSteps(raw.verify.steps) };
  }
  if (raw.changeset !== undefined) {
    if (!isRecord(raw.changeset)) return failConfig('tooling.changeset', 'an object');
    assertOnlyKeys(raw.changeset, 'tooling.changeset', ['singlePackage']);
    const { singlePackage } = raw.changeset;
    if (singlePackage !== undefined && typeof singlePackage !== 'boolean') {
      return failConfig('tooling.changeset.singlePackage', 'a boolean');
    }
    config.changeset = singlePackage === undefined ? {} : { singlePackage };
  }
  return config;
};

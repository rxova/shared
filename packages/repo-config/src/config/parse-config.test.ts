import { describe, expect, it } from 'vitest';
import { parseConfig } from '@/config/parse-config';

describe('parseConfig', () => {
  it('is empty when the field is absent', () => {
    expect(parseConfig(undefined)).toEqual({});
  });

  it('reads verify steps and the changeset rule', () => {
    expect(
      parseConfig({
        verify: { steps: [{ name: 'lint', command: 'pnpm lint' }] },
        changeset: { singlePackage: true },
      }),
    ).toEqual({
      verify: { steps: [{ name: 'lint', command: 'pnpm lint' }] },
      changeset: { singlePackage: true },
    });
  });

  it('keeps empty sections empty', () => {
    expect(parseConfig({ verify: {}, changeset: {} })).toEqual({ verify: {}, changeset: {} });
  });

  it.each([
    [[], 'package.json#repoConfig must be an object'],
    [{ verfy: {} }, 'unknown key "verfy"'],
    [{ verify: [] }, 'package.json#repoConfig.verify must be an object'],
    [{ verify: { step: [] } }, 'unknown key "step"'],
    [{ verify: { steps: {} } }, 'repoConfig.verify.steps must be an array'],
    [{ verify: { steps: [{ name: 'x' }] } }, 'repoConfig.verify.steps[0] must be'],
    [{ changeset: true }, 'repoConfig.changeset must be an object'],
    [{ changeset: { single: true } }, 'unknown key "single"'],
    [{ changeset: { singlePackage: 'yes' } }, 'singlePackage must be a boolean'],
  ])('rejects %j', (raw, message) => {
    expect(() => parseConfig(raw)).toThrow(message);
  });
});

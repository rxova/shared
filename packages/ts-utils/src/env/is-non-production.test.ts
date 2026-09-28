import { afterEach, describe, expect, it, vi } from 'vitest';
import { isNonProduction } from '@/env/is-non-production';

afterEach(() => {
  // Globals first: with `process` stubbed away, unstubbing env would throw.
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('isNonProduction', () => {
  it('lets PROD win over DEV and over NODE_ENV', () => {
    expect(isNonProduction({ bundlerEnv: { PROD: true, DEV: true }, nodeEnv: 'development' })).toBe(
      false,
    );
  });

  it('takes DEV as a yes', () => {
    expect(isNonProduction({ bundlerEnv: { DEV: true }, nodeEnv: 'production' })).toBe(true);
  });

  it('ignores flags that are not literally true, and a missing bundler env', () => {
    expect(isNonProduction({ bundlerEnv: { PROD: 'true', DEV: 1 }, nodeEnv: 'test' })).toBe(true);
    expect(isNonProduction({ bundlerEnv: null, nodeEnv: 'production' })).toBe(false);
  });

  it.each([
    ['development', true],
    ['test', true],
    ['production', false],
  ])('reads an explicit nodeEnv %s as %s', (nodeEnv, expected) => {
    expect(isNonProduction({ nodeEnv })).toBe(expected);
  });

  it('is no when an explicit nodeEnv is undefined, without reading process', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isNonProduction({ nodeEnv: undefined })).toBe(false);
  });

  it('reads process.env.NODE_ENV when nodeEnv is not given', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(isNonProduction()).toBe(true);
    vi.stubEnv('NODE_ENV', 'production');
    expect(isNonProduction()).toBe(false);
  });

  it('is no when NODE_ENV is unset or process is missing', () => {
    vi.stubEnv('NODE_ENV', undefined);
    expect(isNonProduction()).toBe(false);
    vi.stubGlobal('process', undefined);
    expect(isNonProduction()).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import { readConfig } from '@/config/read-config';

describe('readConfig', () => {
  it('reads the tooling field of the root manifest', () => {
    const read = () => JSON.stringify({ tooling: { changeset: { singlePackage: true } } });
    expect(readConfig('/repo', read)).toEqual({ changeset: { singlePackage: true } });
  });

  it('is empty without a manifest or a field', () => {
    expect(readConfig('/repo', () => undefined)).toEqual({});
    expect(readConfig('/repo', () => '{"name":"x"}')).toEqual({});
  });

  it('reads this repository for real, from disk', () => {
    expect(readConfig(new URL('../../../../', import.meta.url).pathname)).toEqual({});
  });
});

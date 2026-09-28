import { describe, expect, it } from 'vitest';
import { parsePackSmokeConfig } from '@/internal/config/parse-pack-smoke-config';

describe('parsePackSmokeConfig', () => {
  it('reads load, bins and runs', () => {
    const config = {
      load: 'never',
      bins: { 'rxova-codemod': { args: ['--help'], expect: 'input-otp-to-otp' } },
      run: [{ bin: 'rxova-codemod', args: [], expect: ['x'] }],
    };
    expect(parsePackSmokeConfig(config, 'p')).toEqual(config);
    expect(parsePackSmokeConfig({}, 'p')).toEqual({});
  });

  it('refuses an unknown load and names nested paths', () => {
    expect(() => parsePackSmokeConfig({ load: 'always' }, 'p')).toThrow('p.load must be one of');
    expect(() => parsePackSmokeConfig({ bins: true }, 'p')).toThrow('p.bins must be false');
    expect(() => parsePackSmokeConfig({ run: {} }, 'p')).toThrow('p.run must be an array');
  });
});

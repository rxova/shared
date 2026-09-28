import { describe, expect, it } from 'vitest';
import { parseBinChecks } from '@/internal/config/parse-bin-checks';

describe('parseBinChecks', () => {
  it('reads false, nothing, or checks by bin', () => {
    expect(parseBinChecks(false, 'p')).toBe(false);
    expect(parseBinChecks(undefined, 'p')).toBeUndefined();
    expect(parseBinChecks({ a: { args: ['--help'], expect: 'x' }, b: {} }, 'p')).toEqual({
      a: { args: ['--help'], expect: 'x' },
      b: { args: [] },
    });
  });

  it.each([
    [true, 'p must be false or an object'],
    [{ x: 'y' }, 'p.x must be an object'],
    [{ x: { args: '--help' } }, 'p.x.args must be an array'],
    [{ x: { run: [] } }, 'unknown key "run"'],
  ])('refuses %j', (value, message) => {
    expect(() => parseBinChecks(value, 'p')).toThrow(message);
  });
});

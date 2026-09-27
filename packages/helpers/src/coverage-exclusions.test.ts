import { describe, expect, it } from 'vitest';
import { COVERAGE_EXCLUSIONS } from './coverage-exclusions.ts';

describe('COVERAGE_EXCLUSIONS', () => {
  it('leaves out tests, fixtures, types and the barrel', () => {
    expect(COVERAGE_EXCLUSIONS).toEqual([
      'src/**/*.test.{ts,tsx}',
      'src/**/*.fixtures.{ts,tsx}',
      'src/**/*.types.ts',
      'src/index.ts',
    ]);
  });
});

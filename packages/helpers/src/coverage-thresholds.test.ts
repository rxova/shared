import { describe, expect, it } from 'vitest';
import { COVERAGE_THRESHOLDS } from './coverage-thresholds.ts';

describe('COVERAGE_THRESHOLDS', () => {
  it('holds every file to 95%', () => {
    expect(COVERAGE_THRESHOLDS).toEqual({
      perFile: true,
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    });
  });
});

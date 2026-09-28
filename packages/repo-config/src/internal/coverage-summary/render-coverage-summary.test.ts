import { describe, expect, it } from 'vitest';
import { renderCoverageSummary } from '@/internal/coverage-summary/render-coverage-summary';

describe('renderCoverageSummary', () => {
  it('prints every axis with two decimals', () => {
    expect(
      renderCoverageSummary({
        lines: { pct: 99.5 },
        branches: { pct: 90 },
        functions: { pct: 100 },
        statements: { pct: 98.123 },
      }),
    ).toBe(
      '## Coverage\n\n- Lines: 99.50%\n- Branches: 90.00%\n- Functions: 100.00%\n- Statements: 98.12%\n',
    );
  });
});

interface Metric {
  pct: number;
}

/** The `total` block of Istanbul's `json-summary` report. */
export interface CoverageTotals {
  lines: Metric;
  branches: Metric;
  functions: Metric;
  statements: Metric;
}

/** A "## Coverage" markdown block for a job summary. */
export const renderCoverageSummary = (total: CoverageTotals): string =>
  [
    '## Coverage',
    '',
    `- Lines: ${total.lines.pct.toFixed(2)}%`,
    `- Branches: ${total.branches.pct.toFixed(2)}%`,
    `- Functions: ${total.functions.pct.toFixed(2)}%`,
    `- Statements: ${total.statements.pct.toFixed(2)}%`,
    '',
  ].join('\n');

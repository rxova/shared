/**
 * The one home of the coverage thresholds.
 *
 * Per file, so one thinly covered module cannot hide behind a well-covered one
 * in the aggregate. Raise them as the suites improve; never lower one to get a
 * build green.
 */
export const COVERAGE_THRESHOLDS = {
  perFile: true,
  statements: 95,
  branches: 95,
  functions: 95,
  lines: 95,
} as const;

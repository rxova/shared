/** The report `check-md-routes` prints when it fails. */
export const formatFailures = (failures: readonly string[]): string =>
  [
    `${String(failures.length)} markdown-route problem(s):`,
    ...failures.map((failure) => `  ✗ ${failure}`),
  ].join('\n');

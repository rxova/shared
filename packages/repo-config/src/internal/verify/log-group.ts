/**
 * Runs `work` under a heading. On GitHub Actions (`fold`) the heading opens a
 * collapsible log group that closes when the work does, pass or fail, so a CI
 * log keeps one fold per step; elsewhere it is a plain line.
 */
export const logGroup = <Result>(title: string, fold: boolean, work: () => Result): Result => {
  process.stdout.write(fold ? `::group::${title}\n` : `\n${title}\n`);
  try {
    return work();
  } finally {
    if (fold) process.stdout.write("::endgroup::\n");
  }
};

/**
 * Whether `--keep-going` is among the arguments: run every step and report
 * all the failures at the end, instead of stopping at the first. A spelling
 * with a value (`--keep-going=…`) throws, so a typo cannot quietly switch it off.
 */
export const keepGoing = (argv: readonly string[]): boolean => {
  const flag = argv.find((arg) => arg === "--keep-going" || arg.startsWith("--keep-going="));
  if (flag === undefined) return false;
  if (flag !== "--keep-going") throw new Error("--keep-going takes no value");
  return true;
};

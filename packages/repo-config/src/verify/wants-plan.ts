/**
 * Whether `--plan` is among the arguments: print the gate as parallel jobs
 * instead of running it. The plan always covers every step, so it takes no
 * value and no other flag; either throws rather than being quietly ignored.
 */
export const wantsPlan = (argv: readonly string[]): boolean => {
  const flag = argv.find((arg) => arg === "--plan" || arg.startsWith("--plan="));
  if (flag === undefined) return false;
  if (flag !== "--plan") throw new Error("--plan takes no value");
  if (argv.length > 1) throw new Error("--plan takes no other flag");
  return true;
};

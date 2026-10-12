/**
 * The comma-separated list after `flag` (`--flag a,b` or `--flag=a,b`), or
 * undefined when the flag is absent. A flag with nothing in its list throws,
 * naming what the list holds.
 */
export const readListFlag = (
  argv: readonly string[],
  flag: string,
  items: string,
): string[] | undefined => {
  const arg = argv.find((candidate) => candidate === flag || candidate.startsWith(`${flag}=`));
  if (arg === undefined) return undefined;

  const value = arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : argv[argv.indexOf(arg) + 1];
  const list = (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (list.length === 0) throw new Error(`${flag} needs a comma-separated list of ${items}`);
  return list;
};

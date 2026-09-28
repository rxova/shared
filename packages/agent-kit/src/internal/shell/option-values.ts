/**
 * The values given to any of `names` in `args`, whether as `--name value`, `--name=value` or,
 * for a one-letter option, `-Xvalue`.
 */
export const optionValues = (args: readonly string[], names: readonly string[]): string[] => {
  const values: string[] = [];
  args.forEach((arg, index) => {
    for (const name of names) {
      if (arg === name) values.push(args[index + 1] ?? "");
      else if (arg.startsWith(`${name}=`)) values.push(arg.slice(name.length + 1));
      else if (/^-[A-Za-z]$/.test(name) && arg.startsWith(name) && arg.length > 2)
        values.push(arg.slice(2));
    }
  });
  return values;
};

/** The `--flags` in `argv`, and any argument that is not one of `known`. */
export const parseFlags = (
  argv: readonly string[],
  known: readonly string[],
): { flags: Set<string>; unknown: string[] } => ({
  flags: new Set(argv.filter((arg) => known.includes(arg))),
  unknown: argv.filter((arg) => !known.includes(arg)),
});

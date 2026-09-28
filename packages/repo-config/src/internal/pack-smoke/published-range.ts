/**
 * The range `pnpm publish` writes for a `workspace:` spec when the workspace
 * package is at `version`: `workspace:^` is `^version`, `workspace:~` is
 * `~version`, `workspace:*` is `version`, and an explicit `workspace:<range>`
 * is `<range>`. Without a version, anything goes.
 */
export const publishedRange = (spec: string, version: string | undefined): string => {
  const range = spec.replace(/^workspace:/, "");
  if (range !== "^" && range !== "~" && range !== "*" && range !== "") return range;
  if (version === undefined) return "*";
  return range === "^" || range === "~" ? `${range}${version}` : version;
};

/**
 * The version pull request's body: a headline, then one line per package
 * whose version moved between `before` and `after`, sorted by name. A package
 * that appears or disappears is not a version change and is left out.
 */
export const versionPrBody = (
  before: Readonly<Record<string, string>>,
  after: Readonly<Record<string, string>>,
): string => {
  const lines = Object.keys(after)
    .sort()
    .flatMap((name) => {
      const old = before[name];
      const next = after[name];
      return old === undefined || old === next ? [] : [`- ${name}: ${old} → ${String(next)}`];
    });
  return ["Merging this pull request versions these packages:", "", ...lines].join("\n");
};

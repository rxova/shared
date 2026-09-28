/**
 * Whether a path inside a package — relative to the package directory — ends
 * up in the tarball npm publishes, directly or by being compiled into `dist`.
 *
 * A `files` entry matches itself and everything under it. A glob is refused
 * rather than guessed at: an entry with a `*` in it is a signal to teach this
 * function about globs.
 */
export const isShippedPath = (path: string, files: readonly string[] = []): boolean => {
  // The directory a package's build writes, and what it is built from. `dist`
  // is gitignored, so it never shows up in a diff: a change reaches it through
  // the source tsdown compiles and through tsdown's own config.
  const buildOutput = "dist";
  const buildInput = /^(src\/|tsdown\.config\.[cm]?[jt]s$)/;
  // npm packs these whatever `files` says: the manifest, and a README and a
  // LICENSE (or LICENCE) at the package root, in any case and with any extension.
  const alwaysPacked = /^(package\.json|(readme|license|licence)(\.[^/]*)?)$/i;
  // Test code in any of the layouts the packages use. None of it is packed.
  const testFile = /(\.(test|spec)\.[cm]?[jt]sx?$|(^|\/)(__tests__|__fixtures__|e2e)\/)/;

  if (testFile.test(path)) return false;
  if (alwaysPacked.test(path)) return true;

  return files.some((raw) => {
    const entry = raw.replace(/^\.\//, "").replace(/\/+$/, "");
    if (entry.includes("*")) {
      throw new Error(`files entry "${raw}" is a glob, which the shipped scope does not expand`);
    }
    if (entry === buildOutput && buildInput.test(path)) return true;
    return path === entry || path.startsWith(`${entry}/`);
  });
};

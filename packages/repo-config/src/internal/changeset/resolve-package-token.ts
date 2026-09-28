import type { VersionedPackage } from '@/internal/changeset/versioned-packages';

/** The one package `token` names, case-insensitively; throws when it names none or several. */
export const resolvePackageToken = (
  token: string,
  packages: readonly VersionedPackage[],
): string => {
  const wanted = token.trim().toLowerCase();
  const matches = packages.filter(({ tokens }) => tokens.includes(wanted));
  const [only] = matches;
  if (only !== undefined && matches.length === 1) return only.name;
  if (matches.length > 1) {
    throw new Error(
      `ambiguous package "${token}": it matches ${matches.map(({ name }) => name).join(', ')}`,
    );
  }
  throw new Error(
    `unknown package "${token}"; the packages are ${packages.map(({ name }) => name).join(', ')}`,
  );
};

import type { PackageManifest } from './manifest.types.js';

/** The command names a package installs: a string `bin` is named after the package. */
export const binsOf = ({ name = '', bin }: PackageManifest): string[] => {
  if (typeof bin === 'string') return [name.replace(/^@[^/]+\//, '')];
  return Object.keys(bin ?? {});
};

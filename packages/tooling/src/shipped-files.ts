import type { PackageManifest } from './manifest.types.js';

/** Files the installed package must hold besides dist, which the probe covers. */
export const shippedFiles = (manifest: PackageManifest): string[] => [
  'LICENSE',
  'README.md',
  ...(manifest.files ?? []).filter((file) => file !== 'dist'),
];

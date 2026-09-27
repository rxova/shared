import type { Published } from './node-floor.types.js';

/**
 * The one Node floor the published packages share, or undefined when nothing
 * is published. Packages that disagree fail here, by name, rather than being
 * tested on whichever floor happened to be read last.
 */
export const decideFloor = (published: Published[]): string | undefined => {
  const floors = [...new Set(published.map((pkg) => pkg.floor))];
  if (floors.length > 1) {
    const each = published.map((pkg) => `${pkg.name} ${pkg.floor}`).join(', ');
    throw new Error(`published packages disagree on the Node floor (${each}); give them one`);
  }
  return floors[0];
};

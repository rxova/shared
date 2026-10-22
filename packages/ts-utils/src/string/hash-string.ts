/**
 * `text` as an unsigned 32-bit FNV-1a hash — a short, stable number to seed a
 * generator with, bucket by or compare cheaply.
 *
 * Not a cryptographic hash and not collision-proof: never use it to
 * authenticate anything or as a primary key. It hashes UTF-16 code units, not
 * UTF-8 bytes, so it agrees with other JavaScript FNV-1a implementations
 * written the same way but not with one in another language.
 *
 * **The number is part of this package's API.** Values derived from it get
 * stored — a seed, a bucket — so the algorithm will not be changed under a
 * minor release.
 */
export const hashString = (text: string): number => {
  let hash = 2166136261;
  for (let at = 0; at < text.length; at += 1) {
    hash ^= text.charCodeAt(at);
    // The FNV prime, 16777619, by shift-and-add: a plain `*` would lose
    // precision past 2 ** 53, while `Math.imul` keeps it to 32 bits.
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

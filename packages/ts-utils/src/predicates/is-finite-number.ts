/**
 * A number that is neither NaN nor an infinity. `Number.isFinite` already
 * answers `false` for a non-number, but TypeScript does not narrow on it; this
 * does, so a value read off parsed JSON can be used as a `number` afterwards.
 */
export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

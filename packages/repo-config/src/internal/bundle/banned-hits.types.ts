/** One banned identifier found in a built file. */
export interface BannedHit {
  /** The file, relative to the package directory. */
  file: string;
  /** 1-based line the identifier is on. */
  line: number;
  /** The identifier that was found. */
  name: string;
}

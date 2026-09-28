/** The fields of a `package.json` the scripts read. Everything is optional: a manifest is JSON a repository wrote. */
export interface PackageManifest {
  name?: string;
  version?: string;
  private?: boolean;
  files?: string[];
  bin?: string | Record<string, string>;
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  /** The exports map, as written: a target string, a conditions object, an array, or null. */
  exports?: unknown;
  dependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  engines?: { node?: string };
}

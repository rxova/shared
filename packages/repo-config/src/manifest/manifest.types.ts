/** The fields of a `package.json` the scripts read. Everything is optional: a manifest is JSON a repository wrote. */
export interface PackageManifest {
  name?: string;
  version?: string;
  private?: boolean;
  files?: string[];
  bin?: string | Record<string, string>;
  dependencies?: Record<string, string>;
  engines?: { node?: string };
}

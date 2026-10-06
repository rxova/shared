/** The semver part of a Dependabot `update-type`, `version-update:semver-<part>`. */
export type SemverUpdate = "major" | "minor" | "patch";

/** What a Dependabot commit message's `updated-dependencies` block says. */
export interface DependabotMetadata {
  /** Every `dependency-name`, in order, each once. */
  names: string[];
  /** Every semver `update-type`, in order. */
  updateTypes: SemverUpdate[];
}

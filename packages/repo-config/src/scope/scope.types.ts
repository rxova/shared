/** The questions check-scope asks a repository. Injected for tests. */
export interface Git {
  /** The paths a commit range touched. */
  names: (base: string, head: string) => string[];
  /** One file's diff across the range, without context lines. */
  patch: (base: string, head: string, file: string) => string;
  /**
   * The paths the range deleted. Without it no documentation change can be
   * told apart from a deletion, so none is skipped.
   */
  deleted?: (base: string, head: string) => string[];
}

/** Which paths change no code, and which feed the docs site (`repoConfig.scope`). */
export interface ScopeRules {
  /** Paths that change no code on their own: documentation. */
  ignore: string[];
  /** Paths that count as code even when `ignore` matches them. */
  keep: string[];
  /** The docs site's sources. */
  site: string[];
}

export interface Scope {
  /** False for a release commit or a documentation-only range: the heavy jobs can skip. */
  codeChanged: boolean;
  /** True when the range changed documentation and nothing else but release bookkeeping. */
  docsOnly: boolean;
  /** True when the range touched the docs site's sources (or the range is unknown). */
  docsChanged: boolean;
  reason: string;
}

/** The two questions check-scope asks a repository. Injected for tests. */
export interface Git {
  /** The paths a commit range touched. */
  names: (base: string, head: string) => string[];
  /** One file's diff across the range, without context lines. */
  patch: (base: string, head: string, file: string) => string;
}

export interface Scope {
  codeChanged: boolean;
  reason: string;
}

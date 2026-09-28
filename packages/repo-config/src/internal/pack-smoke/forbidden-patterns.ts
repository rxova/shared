/**
 * What a tarball never ships by accident, one pattern per kind of path: the
 * sources under `src/`, end-to-end suites under `e2e/`, anything in a
 * `__tests__` directory, and any `*.test.*` or `*.spec.*` file.
 */
export const FORBIDDEN_PATTERNS: readonly RegExp[] = [
  /^src(?:\/|$)/,
  /^e2e(?:\/|$)/,
  /(?:^|\/)__tests__(?:\/|$)/,
  /(?:^|\/)[^/]*\.(?:test|spec)\.[^/]*$/,
];

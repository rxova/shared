/**
 * Line shapes `@changesets/changelog-github` reads as changelog metadata
 * rather than prose. Its `getReleaseLine` runs these over the whole summary,
 * strips each match and uses the captured value. A `commit:` line is the
 * dangerous one: the value is interpolated into a GraphQL alias
 * (`commit__${value}`), so a summary holding a TypeScript snippet whose
 * `commit` property starts a line produces `commit__({` and the release job
 * dies on `Expected NAME, actual: LCURLY` after every other gate passed.
 *
 * The upstream regexes, flags included: case-insensitive, anchored per line,
 * blind to code fences.
 */
export const OVERRIDE_PATTERNS: readonly { name: string; pattern: RegExp }[] = [
  { name: "commit:", pattern: /^\s*commit:\s*[^\s]+/i },
  { name: "pr: / pull: / pull request:", pattern: /^\s*(?:pr|pull|pull\s+request):\s*#?\d+/i },
  { name: "author: / user:", pattern: /^\s*(?:author|user):\s*@?[^\s]+/i },
];

/**
 * Whether a pre-push hook's input updates any ref. Git writes one
 * `<local ref> <local sha> <remote ref> <remote sha>` line per ref; a deletion
 * is a line whose local sha is all zeros. A push that only deletes (a remote
 * branch removed from a GUI client, `git push --delete`) sends no commits, so
 * there is nothing to verify — and no line at all means nothing is pushed.
 */
export const pushesCode = (input: string): boolean =>
  input
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[1] ?? '')
    .some((sha) => /[^0]/.test(sha));

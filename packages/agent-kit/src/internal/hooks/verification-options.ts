// Options whose next word is a value (a message, a file, an author), never a flag.
export const VALUE_OPTIONS = new Set(['-m', '--message', '-F', '--file']);
export const COMMIT_VALUE_OPTIONS = new Set([
  ...VALUE_OPTIONS,
  '-C',
  '--reuse-message',
  '-c',
  '--reedit-message',
  '-t',
  '--template',
  '--author',
  '--date',
  '--trailer',
  '--cleanup',
  '--fixup',
  '--squash',
]);
// In a `git commit` cluster such as `-am`, these letters take the rest as their value.
export const COMMIT_VALUE_LETTERS = 'mFCct';

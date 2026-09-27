import type { Git } from '../../tooling/src/scope.types.ts';

/** A fake repository: `--name-only` lists files, `--unified=0` returns a diff per file. */
export const fakeGit =
  (files: string[], patches: Record<string, string> = {}): Git =>
  (...args) => {
    if (args.includes('--name-only')) return files.join('\n');
    return patches[args[args.length - 1] ?? ''] ?? '';
  };

/** A patch that moves only the version line of a manifest. */
export const BUMP = [
  '--- a/packages/example/package.json',
  '+++ b/packages/example/package.json',
  '@@ -3 +3 @@',
  '-  "version": "0.1.0",',
  '+  "version": "0.2.0",',
].join('\n');

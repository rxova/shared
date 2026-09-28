import { bannedMatches } from '@/internal/docs/banned-matches';
import { readmeFiles } from '@/internal/docs/readme-files';
import { matchesAny } from '@/internal/files/matches-any';
import { walkFiles } from '@/internal/files/walk-files';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config check-banned`: no hand-written doc names an API that no
 * longer exists. The names are `repoConfig.docs.banned` — `{ name, pattern,
 * flags? }` with the pattern as a regex source, so `\\buseApi\\b` leaves
 * `useApiResult` alone. Every `.md` and `.mdx` under `repoConfig.docs.root`
 * (`apps/docs/src/content/docs`) is scanned except the `exclude` globs
 * (generated reference, cut versions) and the `allow` globs (the migration
 * guide and release notes, where old names belong); so are the root and
 * package READMEs unless `readmes` is false. Returns the process exit code.
 */
export const checkBannedCommand = ({ root = process.cwd() }: { root?: string } = {}): number => {
  try {
    const {
      root: docsRoot = 'apps/docs/src/content/docs',
      banned = [],
      allow = [],
      exclude = [],
      readmes = true,
    } = readConfig(root).docs ?? {};
    const docs = walkFiles(join(root, docsRoot))
      .filter((path) => /\.mdx?$/.test(path) && !matchesAny(path, [...allow, ...exclude]))
      .map((path) => `${docsRoot}/${path}`);
    const files = [...docs, ...(readmes ? readmeFiles(root) : [])];
    const found = files.flatMap((file) =>
      bannedMatches(readFileSync(join(root, file), 'utf8'), banned).map(
        ({ line, name }) => `  ${file}:${String(line)} (${name})`,
      ),
    );
    if (found.length > 0) {
      console.error(
        [
          'check-banned: these docs name APIs that no longer exist:',
          ...found,
          'Rewrite them against the current API, or move history into a page repoConfig.docs.allow names.',
        ].join('\n'),
      );
      return 1;
    }
    console.log(
      `check-banned: ${String(files.length)} file(s) free of ${String(banned.length)} banned name(s)`,
    );
    return 0;
  } catch (failure) {
    console.error(`check-banned failed — ${(failure as Error).message}`);
    return 1;
  }
};

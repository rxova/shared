import { missingTsdoc } from '@/internal/tsdoc/missing-tsdoc';
import { tsdocSources } from '@/internal/tsdoc/tsdoc-sources';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config check-tsdoc`: every callable export of every published
 * package's entry carries a TSDoc summary — the text an editor shows on hover
 * and the generated reference prints. The entry is
 * `packages/<dir>/src/index.ts` unless `repoConfig.tsdoc.entries` names
 * another; `repoConfig.tsdoc.exclude` lists exports that need none. Needs
 * `typescript`. Returns the process exit code.
 */
export const checkTsdocCommand = ({ root = process.cwd() }: { root?: string } = {}): number => {
  try {
    const { entries, exclude } = readConfig(root).tsdoc ?? {};
    const sources = tsdocSources(root, entries);
    const missing = sources.flatMap((source) =>
      missingTsdoc(source, root, exclude).map((item) => ({ ...item, pkg: source.name })),
    );
    if (missing.length > 0) {
      console.error(
        [
          'check-tsdoc: these public exports have no TSDoc summary:',
          ...missing.map(({ pkg, name, where }) => `  ${pkg}#${name} (${where})`),
        ].join('\n'),
      );
      return 1;
    }
    console.log(
      `check-tsdoc: every callable export of ${String(sources.length)} package(s) is documented`,
    );
    return 0;
  } catch (failure) {
    console.error(`check-tsdoc failed — ${(failure as Error).message}`);
    return 1;
  }
};

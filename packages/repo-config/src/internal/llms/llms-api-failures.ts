import { join } from 'node:path';
import type { LlmsConfig } from '@/config/config.types';
import { declaredExports } from '@/internal/llms/declared-exports';
import { declaredProps } from '@/internal/llms/declared-props';
import { documentedExports } from '@/internal/llms/documented-exports';
import { documentedProps } from '@/internal/llms/documented-props';
import { entryFiles } from '@/internal/llms/entry-files';
import { LLMS_FILE } from '@/internal/llms/llms-file';

/**
 * Where a package's `llms.txt` table has drifted from its source, by `api`:
 *
 * - `exact`: the `## API` table and the entries name the same exports, both ways;
 * - `documented`: every name in the `## API` table is exported (a package
 *   without a table is exempt);
 * - `props`: every name in a `## Props` table is a property in `src/types.ts`;
 * - `none`: nothing.
 *
 * `entries: "subpaths"` reads `src/<dir>/index.ts` as well as `src/index.ts`.
 */
export const llmsApiFailures = (
  pkgDir: string,
  body: string,
  { api = 'exact', entries = 'index' }: LlmsConfig = {},
): string[] => {
  if (api === 'none') return [];
  if (api === 'props') {
    const documented = documentedProps(body);
    if (documented.length === 0) return [];
    const declared = declaredProps(join(pkgDir, 'src', 'types.ts'));
    if (declared.size === 0) {
      return [`${LLMS_FILE} documents props, but src/types.ts declares none to check against`];
    }
    return documented
      .filter((name) => !declared.has(name))
      .map((name) => `${LLMS_FILE} documents \`${name}\`, which no longer exists in src/types.ts`);
  }

  const documented = documentedExports(body);
  if (api === 'documented' && documented.length === 0) return [];
  const files = entryFiles(pkgDir, entries);
  const subpaths = entries === 'subpaths';
  if (files.length === 0)
    return [`has no src/index.ts to check the ${LLMS_FILE} API table against`];
  const declared = new Set(files.flatMap((file) => [...declaredExports(file)]));
  const failures = documented
    .filter((name) => !declared.has(name))
    .map(
      (name) =>
        `${LLMS_FILE} documents \`${name}\`, which ${subpaths ? 'no entry point exports' : 'src/index.ts does not export'}`,
    );
  if (api === 'documented') return failures;
  const listed = new Set(documented);
  return [
    ...failures,
    ...[...declared]
      .filter((name) => !listed.has(name))
      .map(
        (name) =>
          `${LLMS_FILE} does not document \`${name}\`, which ${subpaths ? 'an entry point' : 'src/index.ts'} exports`,
      ),
  ];
};

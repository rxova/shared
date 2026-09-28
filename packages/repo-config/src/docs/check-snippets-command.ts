import { fencedSnippets } from '@/internal/docs/fenced-snippets';
import { snippetProblems } from '@/internal/docs/snippet-problems';
import { expandGlobs } from '@/internal/files/expand-globs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { readConfig } from '@/config/read-config';

/**
 * `rxova-repo-config check-snippets`: every `ts`, `tsx`, `js` and `jsx` code
 * fence in the copy-paste surface parses as a module — the first code a
 * reader, or an agent reading `llms.txt` out of `node_modules`, will run. The
 * files are `repoConfig.snippets.include` (the root README, and each
 * package's README and `llms.txt`); a fence whose info string holds a
 * `skipInfo` word (`live`: a playground block rendered against an injected
 * scope) is skipped. Needs `typescript`. Returns the process exit code.
 */
export const checkSnippetsCommand = ({ root = process.cwd() }: { root?: string } = {}): number => {
  try {
    const {
      include = ['README.md', 'packages/*/README.md', 'packages/*/llms.txt'],
      skipInfo = ['live'],
    } = readConfig(root).snippets ?? {};
    const files = expandGlobs(root, include);
    let checked = 0;
    const problems = files.flatMap((file) =>
      fencedSnippets(readFileSync(join(root, file), 'utf8'))
        .filter(({ info }) => !info.split(/\s+/).some((word) => skipInfo.includes(word)))
        .flatMap((snippet) => {
          checked += 1;
          return snippetProblems(snippet).map(
            (problem) => `  ${file}:${String(snippet.line)} ${problem}`,
          );
        }),
    );
    if (problems.length > 0) {
      console.error(
        ['check-snippets: these code snippets would not run as written:', ...problems].join('\n'),
      );
      return 1;
    }
    console.log(
      `check-snippets: ${String(checked)} snippet(s) in ${String(files.length)} file(s) parse`,
    );
    return 0;
  } catch (failure) {
    console.error(`check-snippets failed — ${(failure as Error).message}`);
    return 1;
  }
};

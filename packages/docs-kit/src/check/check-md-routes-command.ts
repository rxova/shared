import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import type { Io } from '@/cli/cli.types';
import { checkMdRoutes } from '@/check/check-md-routes';
import { consoleIo } from '@/internal/cli/console-io';
import { formatFailures } from '@/internal/check/format-failures';
import { parseBytes } from '@/internal/check/parse-bytes';
import { splitList } from '@/internal/check/split-list';

/**
 * `rxova-docs-kit check-md-routes [dist] [--untwinned a,b/] [--max-full 800k]
 * [--max-index 24k] [--components A,B]`: `checkMdRoutes` over a built site,
 * `./dist` by default, as the step after `astro build`. Exit 1 on any problem,
 * 2 on a bad argument.
 */
export const checkMdRoutesCommand = async (
  argv: readonly string[],
  io: Io = consoleIo,
): Promise<number> => {
  let parsed;
  try {
    parsed = parseArgs({
      args: [...argv],
      allowPositionals: true,
      options: {
        untwinned: { type: 'string' },
        'max-full': { type: 'string' },
        'max-index': { type: 'string' },
        components: { type: 'string' },
      },
    });
  } catch (error) {
    io.err(`rxova-docs-kit check-md-routes: ${(error as Error).message}`);
    return 2;
  }
  const { values, positionals } = parsed;

  const sizes: Record<string, number | undefined> = {};
  for (const flag of ['max-full', 'max-index'] as const) {
    const raw = values[flag];
    if (raw === undefined) continue;
    sizes[flag] = parseBytes(raw);
    if (sizes[flag] === undefined) {
      io.err(`rxova-docs-kit check-md-routes: --${flag} takes a size such as 800k, not "${raw}"`);
      return 2;
    }
  }

  const unwrap = splitList(values.components);
  const { failures, twins } = await checkMdRoutes(resolve(positionals[0] ?? 'dist'), {
    untwinned: splitList(values.untwinned),
    maxFullBytes: sizes['max-full'],
    maxIndexBytes: sizes['max-index'],
    components: unwrap === undefined ? undefined : { unwrap },
  });
  if (failures.length > 0) {
    io.err(formatFailures(failures));
    return 1;
  }
  io.out(`✔ ${String(twins)} markdown twin(s), no unhandled markup, no dangling links`);
  return 0;
};

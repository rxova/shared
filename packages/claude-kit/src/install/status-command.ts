import { existsSync, readFileSync } from 'node:fs';
import type { InstallEnv } from '@/install/install.types';
import { hookGroups } from '@/install/hook-groups';
import { installCopies } from '@/install/install-copies';
import { defaultEnv } from '@/internal/install/default-env';
import { fromTarget } from '@/internal/install/from-target';
import { countOwnHooks } from '@/internal/install/count-own-hooks';
import { packageVersionAt } from '@/internal/install/package-version-at';
import { parseOptions } from '@/internal/install/parse-options';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';
import { targetDir } from '@/internal/install/target-dir';

/**
 * `rxova-claude-kit status [--project]`: the installed version against this one, files that are
 * missing or differ from this version, and how many guard hooks are registered. Exits 1 when
 * anything is out of step, so it can gate a script.
 */
export const statusCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, ['project']);
    const target = targetDir(options.project === true, env);
    const manifest = readManifest(target);
    if (manifest === undefined) {
      io.out(`rx-ai is not installed in ${target}.`);
      return 1;
    }
    const version = packageVersionAt(env.packageDir);
    const sources = new Map(
      installCopies(env.packageDir, manifest.items).map(({ from, to }) => [to, from]),
    );
    const problems: string[] = [];
    for (const file of manifest.files) {
      const path = fromTarget(target, file);
      const source = sources.get(file);
      if (!existsSync(path)) problems.push(`  missing  ${file}`);
      else if (
        source !== undefined &&
        existsSync(source) &&
        !readFileSync(path).equals(readFileSync(source))
      )
        problems.push(`  changed  ${file}`);
    }
    const hooks = countOwnHooks(readSettings(target));
    const expected = Object.values(hookGroups('rx-ai/hooks.js', manifest.items)).flatMap((groups) =>
      groups.flatMap((group) => group.hooks),
    ).length;
    if (hooks !== expected)
      problems.push(`  hooks    ${String(hooks)} registered, ${String(expected)} expected`);
    io.out(
      `rx-ai ${manifest.version} (${manifest.profile}) in ${target} (this package is ${version})`,
    );
    io.out(
      `  ${String(manifest.items.length)} items, ${String(manifest.files.length)} files, ${String(hooks)} hooks registered`,
    );
    for (const problem of problems) io.out(problem);
    return problems.length === 0 && manifest.version === version ? 0 : 1;
  } catch (failure) {
    io.err(`rxova-claude-kit status: ${(failure as Error).message}`);
    return 1;
  }
};

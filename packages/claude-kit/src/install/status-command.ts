import { existsSync, readFileSync } from 'node:fs';
import type { InstallEnv } from '@/install/install.types';
import { hookGroups } from '@/install/hook-groups';
import { installCopies } from '@/install/install-copies';
import { installedTargets } from '@/install/installed-targets';
import { countOwnHooks } from '@/internal/install/count-own-hooks';
import { defaultEnv } from '@/internal/install/default-env';
import { fromTarget } from '@/internal/install/from-target';
import { packageVersionAt } from '@/internal/install/package-version-at';
import { parseOptions } from '@/internal/install/parse-options';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';

/**
 * `rxova-claude-kit status [--target claude|opencode|both] [--project]`: for each installed
 * target, the installed profile and version against this one, files missing or different from
 * this version, and for Claude Code whether the hook entries are all there. Exits 1 when
 * anything is out of step or nothing is installed, so it can gate a script.
 */
export const statusCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, ['project', 'target']);
    const targets = installedTargets(options.target, options.project === true, env, null);
    if (targets.length === 0) {
      io.out('rx-ai is not installed here.');
      return 1;
    }
    const version = packageVersionAt(env.packageDir);
    let healthy = true;
    for (const target of targets) {
      const manifest = readManifest(target.root);
      if (manifest === undefined) {
        io.out(`rx-ai is not installed in ${target.root}.`);
        healthy = false;
        continue;
      }
      const withSkills = !(
        target.kind === 'opencode' && !manifest.files.some((file) => file.startsWith('skills/'))
      );
      const sources = new Map(
        installCopies(env.packageDir, manifest.items, target, { withSkills }).map((copy) => [
          copy.to,
          copy,
        ]),
      );
      const problems: string[] = [];
      for (const file of manifest.files) {
        const path = fromTarget(target.root, file);
        const source = sources.get(file);
        const expected =
          source === undefined
            ? undefined
            : source.text !== undefined
              ? Buffer.from(source.text)
              : existsSync(source.from)
                ? readFileSync(source.from)
                : undefined;
        if (!existsSync(path)) problems.push(`  missing  ${file}`);
        else if (expected !== undefined && !readFileSync(path).equals(expected))
          problems.push(`  changed  ${file}`);
      }
      let hooks = '';
      if (target.kind === 'claude') {
        const registered = countOwnHooks(readSettings(target.root));
        const expected = Object.values(hookGroups('rx-ai/hooks.js', manifest.items)).flatMap(
          (groups) => groups.flatMap((group) => group.hooks),
        ).length;
        hooks = `, ${String(registered)} hooks registered`;
        if (registered !== expected)
          problems.push(
            `  hooks    ${String(registered)} registered, ${String(expected)} expected`,
          );
      }
      io.out(
        `rx-ai ${manifest.version} (${manifest.profile}) for ${target.kind === 'claude' ? 'Claude Code' : 'OpenCode'} in ${target.root} (this package is ${version})`,
      );
      io.out(
        `  ${String(manifest.items.length)} items, ${String(manifest.files.length)} files${hooks}`,
      );
      for (const problem of problems) io.out(problem);
      if (problems.length > 0 || manifest.version !== version) healthy = false;
    }
    return healthy ? 0 : 1;
  } catch (failure) {
    io.err(`rxova-claude-kit status: ${(failure as Error).message}`);
    return 1;
  }
};

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { InstallEnv } from '@/install/install.types';
import { hookGroups } from '@/install/hook-groups';
import { planInstall } from '@/install/plan-install';
import { withOwnHooks } from '@/install/with-own-hooks';
import { defaultEnv } from '@/internal/install/default-env';
import { fromTarget } from '@/internal/install/from-target';
import { packageVersionAt } from '@/internal/install/package-version-at';
import { parseFlags } from '@/internal/install/parse-flags';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';
import { removeFiles } from '@/internal/install/remove-files';
import { MANIFEST, RUNNER } from '@/internal/install/install-paths';
import { targetDir } from '@/internal/install/target-dir';
import { writeJson } from '@/internal/install/write-json';

/**
 * `rxova-ai install [--project] [--dry-run] [--force]`: copies the agents, skills and hook
 * runner into `.claude`, registers the guards in its `settings.json`, and records what it wrote.
 * Running it again updates in place; files an earlier version wrote and this one does not are
 * removed.
 */
export const installCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  const { flags, unknown } = parseFlags(argv, ['--project', '--dry-run', '--force']);
  if (unknown.length > 0) {
    io.err(`rxova-ai install: unknown option ${unknown.join(' ')}`);
    return 1;
  }
  if (!existsSync(join(env.packageDir, 'dist', 'hooks.js'))) {
    io.err('rxova-ai install: dist/hooks.js is missing; build the package first');
    return 1;
  }
  try {
    const target = targetDir(flags.has('--project'), env);
    const previous = readManifest(target);
    const plan = planInstall({
      packageDir: env.packageDir,
      previous,
      exists: (file) => existsSync(fromTarget(target, file)),
    });
    if (plan.conflicts.length > 0 && !flags.has('--force')) {
      io.err(
        `rxova-ai install: these already exist and were not written by rxova-ai:\n` +
          `${plan.conflicts.map((file) => `  ${file}`).join('\n')}\nMove them, or pass --force to overwrite.`,
      );
      return 1;
    }
    const written = plan.copies.map(({ to }) => to);
    const stale = (previous?.files ?? []).filter((file) => !written.includes(file));
    const settings = withOwnHooks(readSettings(target), hookGroups(fromTarget(target, RUNNER)));

    if (flags.has('--dry-run')) {
      io.out(`Would install into ${target}:`);
      for (const file of written) io.out(`  write   ${file}`);
      for (const file of stale) io.out(`  remove  ${file}`);
      io.out('  update  settings.json (the rx-ai hooks)');
      return 0;
    }
    for (const { from, to } of plan.copies) {
      const path = fromTarget(target, to);
      mkdirSync(dirname(path), { recursive: true });
      copyFileSync(from, path);
    }
    removeFiles(target, stale);
    writeJson(join(target, 'settings.json'), settings);
    writeJson(fromTarget(target, MANIFEST), {
      version: packageVersionAt(env.packageDir),
      files: written,
    });
    io.out(`Installed rx-ai into ${target}: ${String(written.length)} files, 3 guards.`);
    return 0;
  } catch (failure) {
    io.err(`rxova-ai install: ${(failure as Error).message}`);
    return 1;
  }
};

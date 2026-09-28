import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { InstallEnv } from '@/install/install.types';
import { catalog } from '@/install/catalog';
import { hookGroups } from '@/install/hook-groups';
import { planInstall } from '@/install/plan-install';
import { selectItems } from '@/install/select-items';
import { withOwnHooks } from '@/install/with-own-hooks';
import { defaultEnv } from '@/internal/install/default-env';
import { fromTarget } from '@/internal/install/from-target';
import { MANIFEST, RUNNER } from '@/internal/install/install-paths';
import { packageVersionAt } from '@/internal/install/package-version-at';
import { parseOptions } from '@/internal/install/parse-options';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';
import { removeFiles } from '@/internal/install/remove-files';
import { targetDir } from '@/internal/install/target-dir';
import { writeJson } from '@/internal/install/write-json';

/**
 * `rxova-claude-kit install [--profile core|hackathon|full] [--add a,b] [--skip c] [--project]
 * [--dry-run] [--force]`: copies the chosen agents and skills and the hook runner into `.claude`,
 * registers the chosen hooks in its `settings.json`, and records what it wrote. Running it again
 * updates in place, keeping the last selection unless told otherwise.
 */
export const installCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, ['project', 'dry-run', 'force', 'profile', 'add', 'skip']);
    if (!existsSync(join(env.packageDir, 'dist', 'hooks.js')))
      throw new Error('dist/hooks.js is missing; build the package first');
    const target = targetDir(options.project === true, env);
    const previous = readManifest(target);
    const items = catalog(env.packageDir);
    const selection = selectItems({
      names: items.map(({ name }) => name),
      profile: options.profile,
      add: options.add ?? [],
      skip: options.skip ?? [],
      previous,
    });
    const plan = planInstall({
      packageDir: env.packageDir,
      items: selection.items,
      previous,
      exists: (file) => existsSync(fromTarget(target, file)),
    });
    if (plan.conflicts.length > 0 && options.force !== true)
      throw new Error(
        `these already exist and were not written by rxova-claude-kit:\n${plan.conflicts.map((file) => `  ${file}`).join('\n')}\n` +
          'Move them, or pass --force to overwrite.',
      );
    const written = plan.copies.map(({ to }) => to);
    const stale = (previous?.files ?? []).filter((file) => !written.includes(file));
    const hookNames = selection.items.filter((name) =>
      items.some((item) => item.name === name && item.kind === 'hook'),
    );
    const settings = withOwnHooks(
      readSettings(target),
      hookGroups(fromTarget(target, RUNNER), hookNames),
    );
    const counts = (['agent', 'skill', 'hook'] as const)
      .map(
        (kind) =>
          `${String(items.filter((item) => item.kind === kind && selection.items.includes(item.name)).length)} ${kind}s`,
      )
      .join(', ');

    if (options['dry-run'] === true) {
      io.out(`Would install the ${selection.profile} selection (${counts}) into ${target}:`);
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
    const createdSettings = previous?.createdSettings ?? !existsSync(join(target, 'settings.json'));
    removeFiles(target, stale);
    writeJson(join(target, 'settings.json'), settings);
    writeJson(fromTarget(target, MANIFEST), {
      version: packageVersionAt(env.packageDir),
      profile: selection.profile,
      items: selection.items,
      files: written,
      createdSettings,
    });
    io.out(`Installed rx-ai (${selection.profile}: ${counts}) into ${target}.`);
    return 0;
  } catch (failure) {
    io.err(`rxova-claude-kit install: ${(failure as Error).message}`);
    return 1;
  }
};

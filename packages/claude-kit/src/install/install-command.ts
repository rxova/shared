import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { InstallEnv } from '@/install/install.types';
import { catalog } from '@/install/catalog';
import { hookGroups } from '@/install/hook-groups';
import { installedTargets } from '@/install/installed-targets';
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
import { writeJson } from '@/internal/install/write-json';

/**
 * `rxova-claude-kit install [--target claude|opencode|both] [--profile core|hackathon|dotnet|full]
 * [--add a,b] [--skip c] [--project] [--dry-run] [--force]`: writes the chosen agents, skills and
 * hooks for Claude Code, OpenCode or both, and records what it wrote in each. Running it again
 * updates in place, keeping each target's last selection unless told otherwise; with no
 * `--target`, it updates the targets already installed (Claude Code on a first install).
 */
export const installCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, [
      'project',
      'dry-run',
      'force',
      'profile',
      'add',
      'skip',
      'target',
    ]);
    if (!existsSync(join(env.packageDir, 'dist', 'hooks.js')))
      throw new Error('dist/hooks.js is missing; build the package first');
    const targets = installedTargets(options.target, options.project === true, env);
    const items = catalog(env.packageDir);
    const both = targets.length > 1;

    const plans = targets.map((target) => {
      const previous = readManifest(target.root);
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
        exists: (file) => existsSync(fromTarget(target.root, file)),
        target,
        withSkills: !(both && target.kind === 'opencode'),
      });
      const written = plan.copies.map(({ to }) => to);
      const counts = (['agent', 'skill', 'hook'] as const)
        .map(
          (kind) =>
            `${String(items.filter((item) => item.kind === kind && selection.items.includes(item.name)).length)} ${kind}s`,
        )
        .join(', ');
      // Read and check settings.json before anything is written, so a broken file stops the
      // install cleanly instead of leaving copies the manifest does not record.
      const hookNames = selection.items.filter((item) =>
        items.some((entry) => entry.name === item && entry.kind === 'hook'),
      );
      const settings =
        target.kind === 'claude'
          ? withOwnHooks(
              readSettings(target.root),
              hookGroups(fromTarget(target.root, RUNNER), hookNames),
            )
          : undefined;
      return {
        target,
        previous,
        selection,
        plan,
        written,
        stale: (previous?.files ?? []).filter((file) => !written.includes(file)),
        counts,
        settings,
      };
    });

    const conflicts = plans.flatMap(({ target, plan }) =>
      plan.conflicts.map((file) => fromTarget(target.root, file)),
    );
    if (conflicts.length > 0 && options.force !== true)
      throw new Error(
        `these already exist and were not written by rxova-claude-kit:\n${conflicts.map((file) => `  ${file}`).join('\n')}\n` +
          'Move them, or pass --force to overwrite.',
      );

    for (const { target, previous, selection, plan, written, stale, counts, settings } of plans) {
      const name = target.kind === 'claude' ? 'Claude Code' : 'OpenCode';
      if (options['dry-run'] === true) {
        io.out(
          `Would install the ${selection.profile} selection (${counts}) for ${name} into ${target.root}:`,
        );
        for (const file of written) io.out(`  write   ${file}`);
        for (const file of stale) io.out(`  remove  ${file}`);
        if (target.kind === 'claude') io.out('  update  settings.json (the rx-ai hooks)');
        continue;
      }
      for (const copy of plan.copies) {
        const path = fromTarget(target.root, copy.to);
        mkdirSync(dirname(path), { recursive: true });
        if (copy.text === undefined) copyFileSync(copy.from, path);
        else writeFileSync(path, copy.text);
      }
      removeFiles(target.root, stale);
      const createdSettings =
        target.kind === 'claude' &&
        (previous?.createdSettings ?? !existsSync(join(target.root, 'settings.json')));
      if (settings !== undefined) writeJson(join(target.root, 'settings.json'), settings);
      writeJson(fromTarget(target.root, MANIFEST), {
        version: packageVersionAt(env.packageDir),
        profile: selection.profile,
        items: selection.items,
        files: written,
        createdSettings,
      });
      io.out(`Installed rx-ai (${selection.profile}: ${counts}) for ${name} into ${target.root}.`);
    }
    return 0;
  } catch (failure) {
    io.err(`rxova-claude-kit install: ${(failure as Error).message}`);
    return 1;
  }
};

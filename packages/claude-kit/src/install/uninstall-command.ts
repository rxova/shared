import { rmSync } from 'node:fs';
import { join } from 'node:path';
import type { InstallEnv } from '@/install/install.types';
import { installedTargets } from '@/install/installed-targets';
import { withoutOwnHooks } from '@/install/without-own-hooks';
import { defaultEnv } from '@/internal/install/default-env';
import { MANIFEST } from '@/internal/install/install-paths';
import { parseOptions } from '@/internal/install/parse-options';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';
import { removeFiles } from '@/internal/install/remove-files';
import { writeJson } from '@/internal/install/write-json';

/**
 * `rxova-claude-kit uninstall [--target claude|opencode|both] [--project] [--dry-run]`: removes
 * the files each target's manifest lists and, for Claude Code, the rx-ai hook entries, leaving
 * every other file and setting as it was. With no `--target`, every installed target.
 */
export const uninstallCommand = (
  argv: readonly string[],
  env: InstallEnv = defaultEnv(),
): number => {
  const { io } = env;
  try {
    const options = parseOptions(argv, ['project', 'dry-run', 'target']);
    let removedAny = false;
    for (const target of installedTargets(options.target, options.project === true, env)) {
      const manifest = readManifest(target.root);
      const settings = target.kind === 'claude' ? readSettings(target.root) : {};
      const cleaned = withoutOwnHooks(settings);
      const hooksChanged = JSON.stringify(cleaned) !== JSON.stringify(settings);
      if (manifest === undefined && !hooksChanged) continue;
      removedAny = true;
      const files = [...(manifest?.files ?? []), MANIFEST];
      if (options['dry-run'] === true) {
        io.out(`Would remove from ${target.root}:`);
        for (const file of files) io.out(`  remove  ${file}`);
        if (hooksChanged) io.out('  update  settings.json (drop the rx-ai hooks)');
        continue;
      }
      const dropSettings = manifest?.createdSettings === true && Object.keys(cleaned).length === 0;
      removeFiles(target.root, [...files, ...(dropSettings ? ['settings.json'] : [])]);
      // The kit's own directory also holds hook state the manifest does not list.
      rmSync(join(target.root, 'rx-ai'), { recursive: true, force: true });
      if (hooksChanged && !dropSettings) writeJson(join(target.root, 'settings.json'), cleaned);
      io.out(`Removed rx-ai from ${target.root}.`);
    }
    if (!removedAny) io.out('rx-ai is not installed here.');
    return 0;
  } catch (failure) {
    io.err(`rxova-claude-kit uninstall: ${(failure as Error).message}`);
    return 1;
  }
};

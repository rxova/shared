import { join } from 'node:path';
import type { InstallEnv } from '@/install/install.types';
import { withoutOwnHooks } from '@/install/without-own-hooks';
import { defaultEnv } from '@/internal/install/default-env';
import { parseFlags } from '@/internal/install/parse-flags';
import { readManifest } from '@/internal/install/read-manifest';
import { readSettings } from '@/internal/install/read-settings';
import { removeFiles } from '@/internal/install/remove-files';
import { MANIFEST } from '@/internal/install/install-paths';
import { targetDir } from '@/internal/install/target-dir';
import { writeJson } from '@/internal/install/write-json';

/**
 * `rxova-ai uninstall [--project] [--dry-run]`: removes the files the manifest lists and the
 * rx-ai hook entries, leaving every other file and setting as it was.
 */
export const uninstallCommand = (
  argv: readonly string[],
  env: InstallEnv = defaultEnv(),
): number => {
  const { io } = env;
  const { flags, unknown } = parseFlags(argv, ['--project', '--dry-run']);
  if (unknown.length > 0) {
    io.err(`rxova-ai uninstall: unknown option ${unknown.join(' ')}`);
    return 1;
  }
  try {
    const target = targetDir(flags.has('--project'), env);
    const manifest = readManifest(target);
    const settings = readSettings(target);
    const cleaned = withoutOwnHooks(settings);
    const hooksChanged = JSON.stringify(cleaned) !== JSON.stringify(settings);
    if (manifest === undefined && !hooksChanged) {
      io.out(`rx-ai is not installed in ${target}.`);
      return 0;
    }
    const files = [...(manifest?.files ?? []), MANIFEST];
    if (flags.has('--dry-run')) {
      io.out(`Would remove from ${target}:`);
      for (const file of files) io.out(`  remove  ${file}`);
      if (hooksChanged) io.out('  update  settings.json (drop the rx-ai hooks)');
      return 0;
    }
    removeFiles(target, files);
    if (hooksChanged) writeJson(join(target, 'settings.json'), cleaned);
    io.out(`Removed rx-ai from ${target}.`);
    return 0;
  } catch (failure) {
    io.err(`rxova-ai uninstall: ${(failure as Error).message}`);
    return 1;
  }
};

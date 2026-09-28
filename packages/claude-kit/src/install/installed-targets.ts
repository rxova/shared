import { existsSync } from 'node:fs';
import type { InstallEnv, InstallTarget } from '@/install/install.types';
import { resolveTargets } from '@/install/resolve-targets';
import { fromTarget } from '@/internal/install/from-target';
import { MANIFEST } from '@/internal/install/install-paths';

/**
 * The targets a command works on. With `--target`, those. Without it, the ones that already hold
 * an rx-ai manifest; when none does, `fallback` (`claude` for install and uninstall, which also
 * cleans up hook entries left without a manifest), or none for `null`.
 */
export const installedTargets = (
  target: string | undefined,
  project: boolean,
  env: Pick<InstallEnv, 'home' | 'cwd' | 'configHome'>,
  fallback: string | null = 'claude',
): InstallTarget[] => {
  if (target !== undefined) return resolveTargets(target, project, env);
  const found = resolveTargets('both', project, env).filter(({ root }) =>
    existsSync(fromTarget(root, MANIFEST)),
  );
  if (found.length > 0) return found;
  return fallback === null ? [] : resolveTargets(fallback, project, env);
};

import { isAbsolute, join } from 'node:path';
import type { InstallEnv, InstallTarget } from '@/install/install.types';
import { targetDir } from '@/internal/install/target-dir';

/**
 * Where each chosen tool's files go. Claude Code: `~/.claude`, or `./.claude` with `--project`.
 * OpenCode: `$XDG_CONFIG_HOME/opencode` (`~/.config/opencode`), or `./.opencode` with
 * `--project`. `target` is `claude`, `opencode` or `both`; throws on anything else.
 */
export const resolveTargets = (
  target: string,
  project: boolean,
  env: Pick<InstallEnv, 'home' | 'cwd' | 'configHome'>,
): InstallTarget[] => {
  if (!['claude', 'opencode', 'both'].includes(target))
    throw new Error(`unknown target "${target}"; choose claude, opencode or both`);
  const targets: InstallTarget[] = [];
  if (target !== 'opencode') targets.push({ kind: 'claude', root: targetDir(project, env) });
  if (target !== 'claude') {
    const base = project ? env.cwd : env.configHome;
    if (!isAbsolute(base))
      throw new Error(
        project
          ? `the working directory "${base}" is not an absolute path`
          : 'no config directory for OpenCode',
      );
    targets.push({
      kind: 'opencode',
      root: project ? join(base, '.opencode') : join(base, 'opencode'),
    });
  }
  return targets;
};

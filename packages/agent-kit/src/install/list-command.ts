import type { InstallEnv } from '@/install/install.types';
import { catalog } from '@/install/catalog';
import { profiles } from '@/install/profiles';
import { defaultEnv } from '@/internal/install/default-env';
import { parseOptions } from '@/internal/install/parse-options';

/**
 * `rxova-agent-kit list [--profile name]`: every agent, skill and hook, the profiles that include it,
 * and what it is for; with `--profile`, only that profile's items.
 */
export const listCommand = (argv: readonly string[], env: InstallEnv = defaultEnv()): number => {
  const { io } = env;
  try {
    const { profile } = parseOptions(argv, ['profile']);
    if (profile !== undefined && !Object.hasOwn(profiles, profile))
      throw new Error(
        `unknown profile "${profile}"; choose one of ${Object.keys(profiles).join(', ')}`,
      );
    const items = catalog(env.packageDir);
    const names = items.map(({ name }) => name);
    const membership = Object.entries(profiles).map(([key, pick]) => ({
      key,
      names: new Set(pick(names)),
    }));
    const shown = items.filter(
      (item) =>
        profile === undefined ||
        membership.some(({ key, names: set }) => key === profile && set.has(item.name)),
    );
    const width = Math.max(...shown.map(({ name }) => name.length), 4);
    for (const kind of ['agent', 'skill', 'hook'] as const) {
      const group = shown.filter((item) => item.kind === kind);
      if (group.length === 0) continue;
      io.out(`${kind}s (${String(group.length)})`);
      for (const { name, summary } of group) {
        const tags = membership
          .map(({ key, names: set }) => (set.has(name) ? key.charAt(0) : '·'))
          .join('');
        const line = summary.length > 88 ? `${summary.slice(0, 87)}…` : summary;
        io.out(`  ${name.padEnd(width)}  ${tags}  ${line}`);
      }
      io.out('');
    }
    io.out(
      `profiles: ${membership.map(({ key, names: set }) => `${key.charAt(0)} = ${key} (${String(set.size)})`).join(', ')}`,
    );
    return 0;
  } catch (failure) {
    io.err(`rxova-agent-kit list: ${(failure as Error).message}`);
    return 1;
  }
};

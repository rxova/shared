import type { HookGroup } from '@/install/install.types';
import { guards } from '@/hooks/guards';

/** The `PreToolUse` entries that run each guard through the installed runner, one per matcher. */
export const hookGroups = (runner: string): HookGroup[] => {
  const groups = new Map<string, HookGroup>();
  for (const [name, { matcher }] of Object.entries(guards)) {
    const group = groups.get(matcher) ?? { matcher, hooks: [] };
    group.hooks.push({ type: 'command', command: `node "${runner}" ${name}`, timeout: 5 });
    groups.set(matcher, group);
  }
  return [...groups.values()];
};

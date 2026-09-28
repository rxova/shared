import { hooks } from '@/hooks/hooks-table';
import type { HookGroup, HookGroups } from '@/install/install.types';

/**
 * The settings entries that run the chosen hooks through the installed runner: one group per
 * event and matcher, each hook a `node "<runner>" <name>` command with its own timeout.
 */
export const hookGroups = (runner: string, names: readonly string[]): HookGroups => {
  const groups: HookGroups = {};
  for (const [name, spec] of Object.entries(hooks)) {
    if (!names.includes(name)) continue;
    for (const { event, matcher } of spec.on) {
      const list = (groups[event] ??= []);
      let group = list.find((entry) => entry.matcher === matcher);
      if (group === undefined) {
        group = matcher === undefined ? { hooks: [] } : { matcher, hooks: [] };
        list.push(group);
      }
      group.hooks.push({
        type: 'command',
        command: `node "${runner}" ${name}`,
        timeout: spec.timeout,
      } satisfies HookGroup['hooks'][number]);
    }
  }
  return groups;
};

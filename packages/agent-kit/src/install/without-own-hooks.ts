import { isRecord } from "@/internal/install/is-record";
import { stripOwnGroup } from "@/internal/install/strip-own-group";

/**
 * A settings object with this kit's hook commands taken out. A group, event or `hooks` key is
 * dropped only when taking them out is what left it empty; everything else is kept as it was.
 */
export const withoutOwnHooks = (settings: Record<string, unknown>): Record<string, unknown> => {
  const { hooks, ...rest } = settings;
  if (!isRecord(hooks)) return settings;
  const kept: Record<string, unknown> = {};
  let emptiedAny = false;
  for (const [event, groups] of Object.entries(hooks)) {
    if (!Array.isArray(groups)) {
      kept[event] = groups;
      continue;
    }
    const stripped = (groups as unknown[]).map(stripOwnGroup);
    const left = stripped.filter(({ emptied }) => !emptied).map(({ group }) => group);
    if (left.length > 0 || groups.length === 0) kept[event] = left;
    else emptiedAny = true;
  }
  return Object.keys(kept).length > 0 || !emptiedAny ? { ...rest, hooks: kept } : rest;
};

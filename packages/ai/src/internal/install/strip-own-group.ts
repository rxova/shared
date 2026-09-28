import { isOwnHook } from '@/internal/install/is-own-hook';
import { isRecord } from '@/internal/install/is-record';

/**
 * One `hooks[event][]` entry without this kit's commands, and whether taking them out left it
 * empty. An entry of any other shape comes back as it was.
 */
export const stripOwnGroup = (group: unknown): { group: unknown; emptied: boolean } => {
  if (!isRecord(group) || !Array.isArray(group.hooks)) return { group, emptied: false };
  const hooks = group.hooks as unknown[];
  const kept = hooks.filter((hook) => !isRecord(hook) || !isOwnHook(hook.command));
  return { group: { ...group, hooks: kept }, emptied: kept.length === 0 && hooks.length > 0 };
};

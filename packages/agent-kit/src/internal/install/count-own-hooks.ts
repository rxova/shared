import { isOwnHook } from '@/internal/install/is-own-hook';
import { isRecord } from '@/internal/install/is-record';

/** How many hook commands in a settings object run this kit's runner. */
export const countOwnHooks = (settings: Record<string, unknown>): number => {
  const hooks = settings.hooks;
  if (!isRecord(hooks)) return 0;
  return Object.values(hooks)
    .flatMap((groups) => (Array.isArray(groups) ? (groups as unknown[]) : []))
    .flatMap((group) =>
      isRecord(group) && Array.isArray(group.hooks) ? (group.hooks as unknown[]) : [],
    )
    .filter((hook) => isRecord(hook) && isOwnHook(hook.command)).length;
};

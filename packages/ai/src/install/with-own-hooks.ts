import type { HookGroup } from '@/install/install.types';
import { isRecord } from '@/internal/install/is-record';
import { withoutOwnHooks } from '@/install/without-own-hooks';

/** A settings object with this kit's `PreToolUse` groups in place of any it had before. */
export const withOwnHooks = (
  settings: Record<string, unknown>,
  groups: readonly HookGroup[],
): Record<string, unknown> => {
  const clean = withoutOwnHooks(settings);
  const hooks = isRecord(clean.hooks) ? clean.hooks : {};
  const pre = Array.isArray(hooks.PreToolUse) ? (hooks.PreToolUse as unknown[]) : [];
  return { ...clean, hooks: { ...hooks, PreToolUse: [...pre, ...groups] } };
};

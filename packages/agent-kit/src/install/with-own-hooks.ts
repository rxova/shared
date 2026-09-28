import type { HookGroups } from "@/install/install.types";
import { isRecord } from "@/internal/install/is-record";
import { withoutOwnHooks } from "@/install/without-own-hooks";

/** A settings object with this kit's hook groups in place of any it had before. */
export const withOwnHooks = (
  settings: Record<string, unknown>,
  groups: HookGroups,
): Record<string, unknown> => {
  const clean = withoutOwnHooks(settings);
  const hooks = isRecord(clean.hooks) ? { ...clean.hooks } : {};
  for (const [event, list] of Object.entries(groups)) {
    const existing = Array.isArray(hooks[event]) ? (hooks[event] as unknown[]) : [];
    hooks[event] = [...existing, ...list];
  }
  return Object.keys(hooks).length > 0 ? { ...clean, hooks } : clean;
};

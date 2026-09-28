import type { HookContext, HookOutcome } from "@/hooks/hook.types";
import { hooks } from "@/hooks/hooks-table";
import { liveContext } from "@/internal/hooks/live-context";
import { switchedOff } from "@/internal/hooks/switched-off";

/**
 * Runs one hook over the raw input Claude Code sent. Anything unexpected (an unknown or
 * switched-off hook, input that is not a JSON object, a hook that throws) ends quietly with exit
 * code 0: a hook must never wedge a session. `RX_AI_OFF` lists hooks to switch off.
 */
export const runHook = (
  name: string,
  raw: string,
  context: HookContext = liveContext(),
): HookOutcome => {
  if (!Object.hasOwn(hooks, name) || switchedOff(context.env.RX_AI_OFF).has(name))
    return { code: 0 };
  try {
    const input: unknown = JSON.parse(raw);
    if (typeof input !== "object" || input === null) return { code: 0 };
    return hooks[name as keyof typeof hooks].run(input, context);
  } catch {
    return { code: 0 };
  }
};

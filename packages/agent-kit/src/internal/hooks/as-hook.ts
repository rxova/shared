import type { Guard, HookInput, HookContext, HookOutcome } from "@/hooks/hook.types";

/** A guard as a hook's work: exit 2 with the reason when it blocks, 0 otherwise. */
export const asHook =
  (name: string, guard: Guard) =>
  (input: HookInput, context: HookContext): HookOutcome => {
    const verdict = guard(input, context);
    return verdict.block ? { code: 2, message: `rx-ai ${name}: ${verdict.reason}` } : { code: 0 };
  };
